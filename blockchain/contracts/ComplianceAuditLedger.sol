// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ComplianceAuditLedger
 * @notice Immutable on-chain audit trail for GeM procurement compliance events.
 */
contract ComplianceAuditLedger {

    address public immutable owner;

    struct AuditEntry {
        bytes32 eventHash;
        string  eventType;
        string  actorId;
        uint256 timestamp;
        bool    exists;
    }

    mapping(bytes32 => AuditEntry) private _entries;
    bytes32[] private _allHashes;

    event EventAnchored(
        bytes32 indexed eventHash,
        string  eventType,
        string  actorId,
        uint256 timestamp,
        uint256 blockNumber
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "ComplianceAuditLedger: caller is not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function anchorEvent(
        bytes32 eventHash,
        string calldata eventType,
        string calldata actorId
    ) external onlyOwner returns (bool) {
        require(eventHash != bytes32(0), "ComplianceAuditLedger: empty hash");
        require(bytes(eventType).length > 0, "ComplianceAuditLedger: empty eventType");
        require(bytes(actorId).length > 0, "ComplianceAuditLedger: empty actorId");
        require(!_entries[eventHash].exists, "ComplianceAuditLedger: event already anchored");

        _entries[eventHash] = AuditEntry({
            eventHash: eventHash,
            eventType: eventType,
            actorId:   actorId,
            timestamp: block.timestamp,
            exists:    true
        });

        _allHashes.push(eventHash);
        emit EventAnchored(eventHash, eventType, actorId, block.timestamp, block.number);
        return true;
    }

    function getEntry(bytes32 eventHash)
        external view
        returns (string memory eventType, string memory actorId, uint256 timestamp, bool exists)
    {
        AuditEntry storage entry = _entries[eventHash];
        return (entry.eventType, entry.actorId, entry.timestamp, entry.exists);
    }

    function verify(bytes32 eventHash) external view returns (bool) {
        return _entries[eventHash].exists;
    }

    function totalEvents() external view returns (uint256) {
        return _allHashes.length;
    }

    function getHashAtIndex(uint256 index) external view returns (bytes32) {
        require(index < _allHashes.length, "ComplianceAuditLedger: index out of bounds");
        return _allHashes[index];
    }
}