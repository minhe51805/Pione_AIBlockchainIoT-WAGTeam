const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Deploying AquaMindData contract...");

  const AquaMindData = await hre.ethers.getContractFactory("AquaMindData");
  const contract = await AquaMindData.deploy();

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("✅ AquaMindData deployed to:", address);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: address,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    "deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("📝 Deployment info saved to deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

