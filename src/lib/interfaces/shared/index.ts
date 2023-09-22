export enum Priority {
  MINIMAL = 'MINIMAL',
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum Status {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export type Breadcrumb = {
  name: string;
  path: string;
};

// DRAFT:
/**
 * READ: Can see the tracker / bugs
 * EDIT: Can edit bugs
 * DELETE: Can delete bugs
 *
 * Note: Only the author of the tracker can edit / delete it.
 */
export type Permission = 'READ' | 'EDIT' | 'DELETE';
