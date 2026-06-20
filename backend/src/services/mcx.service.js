/**
 * Dummy service to fetch Live MCX 24K Rate
 * As per requirements, we will return a static dummy value of 1,60,000 for 10gms for now.
 */

const getLiveMcxRate24K = async () => {
  // In the future, this will be an actual API call to an MCX provider.
  // For now, return the dummy rate.
  return 160000;
};

module.exports = {
  getLiveMcxRate24K
};
