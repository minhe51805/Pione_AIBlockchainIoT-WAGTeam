// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SoilDataStore {
    // Lưu dữ liệu cảm biến đất mới (8 trường)
    // Quy ước:
    // - measuredAtVN: Unix epoch seconds (thời điểm VN)
    // - temperatureC: nhiệt độ C nhân 10 (ví dụ 27.1°C => 271)
    // - humidityPct: % độ ẩm không khí (0..100) nhân 10 (45.5% => 455)
    // - conductivity: độ dẫn điện µS/cm (0-2000+)
    // - phValue: pH nhân 10 (pH 6.5 => 65)
    // - nitrogen: Nitơ mg/kg (0-1999)
    // - phosphorus: Photpho mg/kg (0-1999)
    // - potassium: Kali mg/kg (0-1999)
    // - salt: Muối mg/L (0-5000+)
    struct SoilData {
        uint256 measuredAtVN;
        uint256 temperatureC;
        uint256 humidityPct;
        uint256 conductivity;
        uint256 phValue;
        uint256 nitrogen;
        uint256 phosphorus;
        uint256 potassium;
        uint256 salt;
        address reporter;
    }

    SoilData[] public records;

    event DataStored(
        uint256 indexed id,
        uint256 measuredAtVN,
        uint256 temperatureC,
        uint256 humidityPct,
        uint256 conductivity,
        uint256 phValue,
        uint256 nitrogen,
        uint256 phosphorus,
        uint256 potassium,
        uint256 salt,
        address reporter
    );

    // Ghi dữ liệu từ DB (đã chuẩn hóa)
    function storeData(
        uint256 _measuredAtVN,
        uint256 _temperatureC,
        uint256 _humidityPct,
        uint256 _conductivity,
        uint256 _phValue,
        uint256 _nitrogen,
        uint256 _phosphorus,
        uint256 _potassium,
        uint256 _salt
    ) public {
        records.push(
            SoilData({
                measuredAtVN: _measuredAtVN,
                temperatureC: _temperatureC,
                humidityPct: _humidityPct,
                conductivity: _conductivity,
                phValue: _phValue,
                nitrogen: _nitrogen,
                phosphorus: _phosphorus,
                potassium: _potassium,
                salt: _salt,
                reporter: msg.sender
            })
        );

        emit DataStored(
            records.length - 1,
            _measuredAtVN,
            _temperatureC,
            _humidityPct,
            _conductivity,
            _phValue,
            _nitrogen,
            _phosphorus,
            _potassium,
            _salt,
            msg.sender
        );
    }

    // Total count
    function getCount() public view returns (uint256) {
        return records.length;
    }

    // Get record by ID
    function getRecord(uint256 id) public view returns (SoilData memory) {
        require(id < records.length, "Invalid ID");
        return records[id];
    }

    // Query by time range (lọc theo measuredAtVN)
    function getRecordsByTimeRange(
        uint256 startTime,
        uint256 endTime
    ) public view returns (SoilData[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < records.length; i++) {
            if (
                records[i].measuredAtVN >= startTime &&
                records[i].measuredAtVN <= endTime
            ) {
                count++;
            }
        }

        SoilData[] memory result = new SoilData[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < records.length; i++) {
            if (
                records[i].measuredAtVN >= startTime &&
                records[i].measuredAtVN <= endTime
            ) {
                result[idx] = records[i];
                idx++;
            }
        }
        return result;
    }
}
