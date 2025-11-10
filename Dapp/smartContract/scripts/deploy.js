const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Deploying AgroTwinData contract...");

  const AgroTwinData = await hre.ethers.getContractFactory("AgroTwinData");
  const contract = await AgroTwinData.deploy();

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("✅ AgroTwinData deployed to:", address);

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

