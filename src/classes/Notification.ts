export enum NotificationType {
  NORMAL = 'normal',
  URGENT = 'urgent',
  IMPORTANT = 'important',
  INFO = 'info'
}

export enum NotificationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  READ = 'read'
}

export class Notification {
  private _id: number | null;
  private _title: string;
  private _description: string;
  private _department: string;
  private _type: NotificationType;
  private _status: NotificationStatus;
  private _createdAt: Date;
  private _requiresAcceptance: boolean;
  private _acceptedAt: Date | null;
  private _rejectedAt: Date | null;

  constructor(
    title: string,
    description: string,
    department: string,
    type: NotificationType = NotificationType.NORMAL,
    requiresAcceptance: boolean = false,
    id: number | null = null,
    status: NotificationStatus = NotificationStatus.PENDING,
    createdAt: Date = new Date(),
    acceptedAt: Date | null = null,
    rejectedAt: Date | null = null
  ) {
    this._id = id;
    this._title = title;
    this._description = description;
    this._department = department;
    this._type = type;
    this._status = status;
    this._createdAt = createdAt;
    this._requiresAcceptance = requiresAcceptance;
    this._acceptedAt = acceptedAt;
    this._rejectedAt = rejectedAt;
  }

  // Getters e Setters
  public get id(): number | null {
    return this._id;
  }
  public set id(value: number | null) {
    this._id = value;
  }

  public get title(): string {
    return this._title;
  }
  public set title(value: string) {
    this._title = value;
  }

  public get description(): string {
    return this._description;
  }
  public set description(value: string) {
    this._description = value;
  }

  public get department(): string {
    return this._department;
  }
  public set department(value: string) {
    this._department = value;
  }

  public get type(): NotificationType {
    return this._type;
  }
  public set type(value: NotificationType) {
    this._type = value;
  }

  public get status(): NotificationStatus {
    return this._status;
  }
  public set status(value: NotificationStatus) {
    this._status = value;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }
  public set createdAt(value: Date) {
    this._createdAt = value;
  }

  public get requiresAcceptance(): boolean {
    return this._requiresAcceptance;
  }
  public set requiresAcceptance(value: boolean) {
    this._requiresAcceptance = value;
  }

  public get acceptedAt(): Date | null {
    return this._acceptedAt;
  }
  public set acceptedAt(value: Date | null) {
    this._acceptedAt = value;
  }

  public get rejectedAt(): Date | null {
    return this._rejectedAt;
  }
  public set rejectedAt(value: Date | null) {
    this._rejectedAt = value;
  }

  // Métodos auxiliares
  public formatTime(): string {
    const hours = this._createdAt.getHours().toString().padStart(2, '0');
    const minutes = this._createdAt.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  public formatDate(): string {
    return this._createdAt.toLocaleDateString('pt-BR');
  }
}
