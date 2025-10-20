I. cấu trúc frame Json giao tiếp giữa các ESP32

1. master (ESP32 có màn hình)
2. slave (ESP32-CAM và ESP32 xử lý cân)

II. các trường dữ liệu:
src → ID thiết bị gửi (ví dụ: "ESP32_1", "ESP32_2").

dst → ID thiết bị nhận (nếu broadcast cho tất cả thì đặt "all").

cmd → loại bản tin:

    "data": gửi dữ liệu sensor

    "request": yêu cầu thông tin từ thiết bị khác

    "response": trả lời yêu cầu

    "control": lệnh điều khiển (bật LED, đổi mode, …)

data → phần nội dung chính (object JSON, tuỳ tình huống).

ví dụ:
{
"id": "ESP32_1",
"dst": "ESP32_2",
"cmd": "data",
"data": {
"temp": 28.3,
"hum": 70
}
}

III. các loại bản tin

1. Bản tin "control"

- bản tin gửi cho ESP32-CAM
  {
  "id": "app",
  "dst": "ESP32_2",
  "cmd": "control",
  "type": "start_detect"  
  }

- bản tin gửi cho ESP32 xử lý cân
  {
  "id": "app",
  "dst": "ESP32_3",
  "cmd": "control",
  "type": "start_scale"
  }

2. bản tin "data"

- ESP32-CAM
  {
  "id": "ESP32_2",
  "dst": "app",
  "cmd": "data",
  "data": {
  "result_detect": "apple",
  "precision": 0.91
  }
  }

- ESP32 xử lý cân (kg)

{
"id": "ESP32_3",
"dst": "app",
"cmd": "data",
"data": {
"weight" : 1.6
}
}

/---------------------------BẢN TIN DEBUG---------------------------/

1. start

gủi:
{
"src": "app",
"dst": "esp32",
"cmd": "debug",
"id": "app"
}

nhận lại:
{
"id":"esp32",
"dst":"app",
"cmd":"debug",
"data":{"status":"streaming","url":"http://192.168.137.11/"}
}

2. stop

gủi:
{
"src": "app",
"dst": "esp32",
"cmd": "stop_debug",
"id": "app"
}

nhận lại:
{
"id":"esp32",
"dst":"app",
"cmd":"debug",
"data":{"status":"stopped"}
}

3. bản tin detect

gửi:
{
"id":"app",
"dst":"esp32",
"cmd":"detect",
"data":{}
}

nhận lại:

{
"id":"esp32",
"dst":"app",
"cmd":"inference",
"data":{"predictions":[{"label":"Carrot","value":0.99609375},{"label":"Cucumber","value":0.00390625},{"label":"Apple","value":0}],
"inference_time":159}
}
