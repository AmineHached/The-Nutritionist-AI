import requests
p='C:/Users/amine hached/Desktop/WORK/Esb/PI 4/TheNutritionist-main/images/image1.jpg'
with open(p,'rb') as f:
    r=requests.post('http://localhost:4200/api/ai/analyze?user_email=test@example.com', files={'file':f})
    print('status', r.status_code)
    print('ctype', r.headers.get('content-type'))
    print(r.text[:2000])
