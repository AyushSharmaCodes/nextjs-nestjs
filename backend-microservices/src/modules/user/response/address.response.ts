export interface AddressResponse {
  id: string;
  profileId: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  countryCode: string;
  postalCode: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
