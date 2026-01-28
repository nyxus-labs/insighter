
export interface UserProfile {
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  phone?: string | null;
}

export function getFullName(user: UserProfile): string {
  const { firstName, lastName, username } = user;
  
  const hasFirstName = firstName && firstName.trim().length > 0;
  const hasLastName = lastName && lastName.trim().length > 0;

  if (hasFirstName && hasLastName) {
    return `${firstName} ${lastName}`;
  }
  
  if (hasFirstName) {
    return firstName!;
  }
  
  if (hasLastName) {
    return lastName!;
  }
  
  return username || 'User';
}
