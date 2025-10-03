async function main() {
  const SoilDataStore = await ethers.getContractFactory("SoilDataStore");
  const store = await SoilDataStore.deploy();
  await store.waitForDeployment();
  console.log("Deployed contract at:", await store.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
