function calculatePetAge(dob: string): string {
  const birthDate = new Date(dob);
  const now = new Date();
  const ageInMonths =
    (now.getFullYear() - birthDate.getFullYear()) * 12 +
    (now.getMonth() - birthDate.getMonth());

  const years = Math.floor(ageInMonths / 12);
  const months = ageInMonths % 12;

  let result = '';
  if (years > 0) result += `${years} year${years > 1 ? 's' : ''} `;
  if (months > 0) result += `${months} month${months > 1 ? 's' : ''}`;
  return result.trim() || 'Less than 1 month';
}

export default calculatePetAge;
