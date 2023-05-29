const hre = require("hardhat");

async function main(){

    const tokenName = "CryptoBie";
    const symbol = "CTB";
    const decimal = 0;
    const rewardRate = 1;
    const totalSupply = 1000;

    const CampaignFactory = await hre.ethers.getContractFactory("StakeToken");  
    const campaignFactory = await CampaignFactory.deploy(tokenName, symbol, decimal, rewardRate, totalSupply);
    await campaignFactory.deployed();
    console.log("Factory deployed to ", campaignFactory.address);
}

main()
.then(()=>process.exit(0))
.catch((error)=>{
    console.log(error);
    process.exit(1);
});