import boto3
import os
import re
import sys

# 从环境变量读取密钥（由 GitHub Actions 注入）
ACCESS_KEY = os.environ["BITIFUL_ACCESS_KEY"]
SECRET_KEY = os.environ["BITIFUL_SECRET_KEY"]
BUCKET = "你的桶名"
# 预签名 URL 有效期（秒），最长 7 天（604800 秒）
EXPIRES_IN = 604800

s3 = boto3.client(
    "s3",
    endpoint_url="https://s3.bitiful.net",  # 缤纷云 S3 端点
    aws_access_key_id=ACCESS_KEY,
    aws_secret_access_key=SECRET_KEY,
    region_name="us-east-1",  # 缤纷云兼容区域，通常填 us-east-1
)

# 列出桶内所有对象
response = s3.list_objects_v2(Bucket=BUCKET)
if "Contents" not in response:
    print("桶为空，无需注入")
    sys.exit(0)

# 为每个对象生成预签名 URL，映射为 {原始路径: 签名URL}
url_map = {}
for obj in response["Contents"]:
    key = obj["Key"]
    url = s3.generate_presigned_url(
        ClientMethod="get_object",
        Params={"Bucket": BUCKET, "Key": key},
        ExpiresIn=EXPIRES_IN,
    )
    url_map[key] = url
    print(f"生成: {key} -> {url[:80]}...")

# 遍历 HTML 文件，将原始路径替换为预签名 URL
html_files = []
for root, dirs, files in os.walk("dist"):  # 假设构建输出在 dist 目录
    for f in files:
        if f.endswith(".html"):
            html_files.append(os.path.join(root, f))

for html_path in html_files:
    with open(html_path, "r", encoding="utf-8") as f:
        content = f.read()
    for key, url in url_map.items():
        # 将 HTML 中指向桶的路径替换为预签名 URL
        # 根据你的实际情况调整替换逻辑，例如 src="图片名.jpg"
        content = content.replace(f'src="{key}"', f'src="{url}"')
        content = content.replace(f"src='{key}'", f"src='{url}'")
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"已注入: {html_path}")

print("完成")