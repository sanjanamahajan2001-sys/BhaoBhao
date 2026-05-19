// adminToken.js
export let adminTokenVersion = 1;

export const incrementAdminTokenVersion = () => {
  adminTokenVersion += 1;
  return adminTokenVersion;
};
