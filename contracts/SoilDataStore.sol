pragma solidity ^0.8.20;

contract SoilDataStore {
    struct SoilData {
        uint256 timestamp;
        uint256 moisture;
        uint256 temperature;
        uint256 humidity;
        address reporter;
    }

    SoilData[] public records;

    event DataStored(
        uint256 indexed id,
        uint256 timestamp,
        uint256 moisture,
        uint256 temperature,
        uint256 humidity,
        address reporter
    );

    // Store JSON data from sensor
    function storeData(
        uint256 _timestamp,
        uint256 _moisture,
        uint256 _temperature,
        uint256 _humidity
    ) public {
        records.push(
            SoilData({
                timestamp: _timestamp,
                moisture: _moisture,
                temperature: _temperature,
                humidity: _humidity,
                reporter: msg.sender
            })
        );

        emit DataStored(
            records.length - 1,
            _timestamp,
            _moisture,
            _temperature,
            _humidity,
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

    // Query by time range
    function getRecordsByTimeRange(
        uint256 startTime,
        uint256 endTime
    ) public view returns (SoilData[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < records.length; i++) {
            if (
                records[i].timestamp >= startTime &&
                records[i].timestamp <= endTime
            ) {
                count++;
            }
        }

        SoilData[] memory result = new SoilData[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < records.length; i++) {
            if (
                records[i].timestamp >= startTime &&
                records[i].timestamp <= endTime
            ) {
                result[idx] = records[i];
                idx++;
            }
        }
        return result;
    }
}
