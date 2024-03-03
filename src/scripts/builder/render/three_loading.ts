export let setThreeLoadingComplete: any;

// Await this to wait until the wallet init process is complete.
export const threeSetupComplete = new Promise((resolve, _) => {
    setThreeLoadingComplete = resolve;
});
