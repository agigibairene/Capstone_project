// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract AgriContract {
    struct AgriConnect {
        address owner;
        string projectTitle;
        string briefDescription;
        uint256 target;
        uint256 deadline;
        address[] donors;
        uint256[] donations;
        uint256 collectedAmount;
    }

    mapping(uint256 => AgriConnect) public projects;
    uint256 public numberOfProjects = 0;

    function createProject(
        address _owner,
        string memory _projectTitle,
        string memory _description,
        uint256 _target,
        uint256 _deadline
    ) public returns (uint256) {
        require(_deadline > block.timestamp, "The deadline should be a future date");

        AgriConnect storage project = projects[numberOfProjects];
        project.owner = _owner;
        project.projectTitle = _projectTitle;
        project.briefDescription = _description;
        project.target = _target;
        project.deadline = _deadline;
        project.collectedAmount = 0;

        numberOfProjects++;

        return numberOfProjects - 1;
    }

    function contributeToProject(uint256 _id) public payable {
        uint256 amount = msg.value;
        AgriConnect storage project = projects[_id];

        project.donors.push(msg.sender);
        project.donations.push(amount);

        (bool sent, ) = payable(project.owner).call{value: amount}("");
        require(sent, "Failed to send Ether");

        project.collectedAmount += amount;
    }

    function getDonors(uint256 _id) public view returns (address[] memory, uint256[] memory) {
        return (projects[_id].donors, projects[_id].donations);
    }

    function getProjects() public view returns (AgriConnect[] memory) {
        AgriConnect[] memory allProjects = new AgriConnect[](numberOfProjects);

        for (uint i = 0; i < numberOfProjects; i++) {
            AgriConnect storage item = projects[i];
            allProjects[i] = item;
        }

        return allProjects;
    }
}
