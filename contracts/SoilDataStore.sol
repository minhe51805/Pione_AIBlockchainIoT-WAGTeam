// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SoilDataStore {
    // Lưu dữ liệu theo yêu cầu: measured_at_vn, temperature_c, humidity_pct, moisture_pct
    // Quy ước:
    // - measuredAtVN: Unix epoch seconds (thời điểm VN – tương đương thời điểm tuyệt đối)
    // - temperatureC: nhiệt độ C nhân 10 (ví dụ 27.1C => 271) để lưu số nguyên
    // - humidityPct: % độ ẩm không khí (0..100)
    // - moisturePct: % độ ẩm đất (0..100)
    struct SoilData {
        uint256 measuredAtVN;
        uint256 temperatureC;
        uint256 humidityPct;
        uint256 moisturePct;
        address reporter;
    }

    SoilData[] public records;

    event DataStored(
        uint256 indexed id,
        uint256 measuredAtVN,
        uint256 temperatureC,
        uint256 humidityPct,
        uint256 moisturePct,
        address reporter
    );

    // Ghi dữ liệu từ DB (đã chuẩn hóa)
    function storeData(
        uint256 _measuredAtVN,
        uint256 _temperatureC,
        uint256 _humidityPct,
        uint256 _moisturePct
    ) public {
        records.push(
            SoilData({
                measuredAtVN: _measuredAtVN,
                temperatureC: _temperatureC,
                humidityPct: _humidityPct,
                moisturePct: _moisturePct,
                reporter: msg.sender
            })
        );

        emit DataStored(
            records.length - 1,
            _measuredAtVN,
            _temperatureC,
            _humidityPct,
            _moisturePct,
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
