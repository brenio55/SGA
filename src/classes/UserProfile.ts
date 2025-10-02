// UserProfile.ts
export class UserProfile {
  private _fullName: string;
  private _role: string;
  private _department: string;
  private _imageSrc: string;

  constructor(
    fullName: string,
    role: string,
    department: string,
    imageSrc: string
  ) {
    this._fullName = fullName;
    this._role = role;
    this._department = department;
    this._imageSrc = imageSrc;
  }

  // Getter e Setter para FullName
  public get fullName(): string {
    return this._fullName;
  }
  public set fullName(value: string) {
    this._fullName = value;
  }

  // Getter e Setter para Role
  public get role(): string {
    return this._role;
  }
  public set role(value: string) {
    this._role = value;
  }

  // Getter e Setter para Department
  public get department(): string {
    return this._department;
  }
  public set department(value: string) {
    this._department = value;
  }

  // Getter e Setter para ImageSrc
  public get imageSrc(): string {
    return this._imageSrc;
  }
  public set imageSrc(value: string) {
    this._imageSrc = value;
  }
}
