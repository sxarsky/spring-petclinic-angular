import {Owner} from './owner';

export interface OwnerPage {
  content: Owner[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
