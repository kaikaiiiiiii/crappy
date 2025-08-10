sudo smartctl -A /dev/sda | grep Temperature_Celsius | awk '{print $10 " °C"}'
sudo smartctl -x /dev/sda | grep 'Min/Max'
