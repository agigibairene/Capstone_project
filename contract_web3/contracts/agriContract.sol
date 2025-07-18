// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract Agriconnect {
    string public title;
    string public description;
    uint256 public targetAmount;
    uint256 public deadline;
    address public farmer;
    bool public  pauseFundRaising;

    enum FundingState { Active, Successful, Failed }
    FundingState public state;

    struct Backer {
        uint256 totalContribution;
    }

    mapping(address => Backer) public backers;

    modifier onlyOwner() {
        require(msg.sender == farmer, "Not the owner of this campaign");
        _;
    }

    modifier fundingOpen() {
        require(state == FundingState.Active, "Project is not active");
        _;
    }

    modifier notPaused(){
        require(!pauseFundRaising, "Fund raising has been paused");
        _;
    }

    constructor(
        string memory _title,
        string memory _description,
        uint256 _targetAmount,
        uint256 _durationInDays
    ) {
        title = _title;
        description = _description;
        targetAmount = _targetAmount;
        deadline = block.timestamp + (_durationInDays * 1 days);
        farmer = msg.sender;
        state = FundingState.Active;
    }

    function checkAndUpdateFundingState() internal {
        if (state == FundingState.Active) {
            if (block.timestamp > deadline) {
                state = address(this).balance >= targetAmount
                    ? FundingState.Successful
                    : FundingState.Failed;
            } else if (address(this).balance >= targetAmount) {
                state = FundingState.Successful;
            }
        }
    }

    function fund() public payable fundingOpen {
        require(msg.value > 0, "Must fund amount greater than 0");
        require(block.timestamp < deadline, "Campaign has expired");

        Backer storage backer = backers[msg.sender];
        backer.totalContribution += msg.value;

        checkAndUpdateFundingState();
    }

    function withdraw() public onlyOwner {
        checkAndUpdateFundingState();
        require(state == FundingState.Successful, "Funding not successful");
        require(address(this).balance >= targetAmount, "Target not reached");
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");

        payable(farmer).transfer(balance);
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function refund() public {
        checkAndUpdateFundingState();
        require(state == FundingState.Failed, "Funding is not failed");
        Backer storage backer = backers[msg.sender];
        uint256 contribution = backer.totalContribution;
        require(contribution > 0, "No contribution to refund");
        backer.totalContribution = 0;
        payable(msg.sender).transfer(contribution);
    }

    function togglePauseCampaign() public onlyOwner{
        pauseFundRaising = !pauseFundRaising;   
    }

    function getFundRaiserStatus() public view returns(FundingState){
        if (state == FundingState.Active && block.timestamp > deadline){
            return address(this).balance >= targetAmount ? FundingState.Successful : FundingState.Failed;
        }
        return state;
    }

    function extendDeadline(uint256 _daysToAdd) public onlyOwner{
        deadline += _daysToAdd * 1 days;
    }
}
