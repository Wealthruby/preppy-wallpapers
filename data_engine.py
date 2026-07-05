!pip install boto3 Pillow requests pandas

import pandas as pd
import requests
import time
import boto3
from io import BytesIO
from PIL import Image

# --- 1. CREDENTIALS ---
UNSPLASH_ACCESS_KEY = os.environ.get("UNSPLASH_ACCESS_KEY")
R2_ACCOUNT_ID = os.environ.get("R2_ACCOUNT_ID")
ACCESS_KEY = os.environ.get("R2_ACCESS_KEY")
SECRET_KEY = os.environ.get("R2_SECRET_KEY")
BUCKET_NAME = "preppy-assets"
PUBLIC_BASE_URL = "https://pub-1b8420dcf8aa49219bb9dddd5261f673.r2.dev"

# --- 2. SETUP CLOUDFLARE ---
s3 = boto3.client('s3',
    endpoint_url=f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
    aws_access_key_id=ACCESS_KEY,
    aws_secret_access_key=SECRET_KEY,
    region_name='auto'
)

# --- 3. LOAD DATABASE ---
# Ensure you have your generated keywords in "seo_database.csv"
df = pd.read_csv("seo_database.csv")
if 'cdn_url' not in df.columns:
    df['cdn_url'] = None

# --- 4. THE ALL-IN-ONE PROCESSOR ---
def process_row(row):
    try:
        # STEP A: FETCH FROM UNSPLASH
        print(f"\n[1/3] Fetching from Unsplash for: {row['slug']}")
        url = f"https://api.unsplash.com/search/photos?query={row['keyword']}&client_id={UNSPLASH_ACCESS_KEY}&per_page=1"
        response = requests.get(url)
        
        if response.status_code != 200:
            print(f"❌ Unsplash API Error: {response.status_code}")
            return None
            
        data = response.json()
        if not data['results']:
            print("❌ No image found on Unsplash.")
            return None
            
        img_url = data['results'][0]['urls']['regular']
        
        # STEP B: DOWNLOAD & OPTIMIZE
        print(f"[2/3] Downloading & Converting {row['slug']} to JPG...")
        img_response = requests.get(img_url)
        img = Image.open(BytesIO(img_response.content)).convert("RGB")
        img.thumbnail((3840, 3840))
        
        buffer = BytesIO()
        img.save(buffer, format="JPEG", quality=85)
        buffer.seek(0)
        
        # STEP C: UPLOAD TO CLOUDFLARE
        file_name = f"{row['slug']}.jpg"
        print(f"[3/3] Uploading to Cloudflare R2: {file_name}...")
        s3.upload_fileobj(
            buffer, 
            BUCKET_NAME, 
            file_name, 
            ExtraArgs={'ContentType': 'image/jpeg'}
        )
        
        final_link = f"{PUBLIC_BASE_URL}/{file_name}"
        print(f"✅ SUCCESS! Image live at: {final_link}")
        return final_link
        
    except Exception as e:
        print(f"❌ ERROR processing {row['slug']}: {str(e)}")
        return None

# --- 5. RUN THE PIPELINE (45 ROWS) ---
print("--- STARTING PIPELINE ---")
for index, row in df.head(45).iterrows():
    cdn_link = process_row(row)
    df.at[index, 'cdn_url'] = cdn_link
    time.sleep(2) # 2-second pause to respect Unsplash API limits

# --- 6. SAVE FINAL DATABASE ---
df.to_csv("final_production_database.csv", index=False)
print("\n--- PIPELINE COMPLETE! Data saved to final_production_database.csv ---")