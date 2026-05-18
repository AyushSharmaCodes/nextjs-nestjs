export interface EventCoHost {
  name: string;
  avatarUrl: string;
}

export interface Event {
  id: string;
  title: string;
  subtitle?: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  location: string;
  description: string;
  imageUrl: string;
  registrationOpen: boolean;
  status: 'completed' | 'coming_soon' | 'ongoing';
  discountTag?: string;
  price?: number;
  featured?: boolean;
  slotsAvailable?: number;
  registeredCount?: number;
  registrationDeadline?: string;
  highlights?: string[];
  privileges?: string[];
  coHosts?: EventCoHost[];
  guestAvatars?: string[];
  guestCount?: number;
}

export interface EventRegistrationInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  slots: number;
}

export interface EventSearchFilters {
  search?: string;
  category?: string;
  type?: string;
  location?: string;
  date?: string;
}
