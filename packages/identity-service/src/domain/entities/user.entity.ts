import { Email } from "../value-objects/email.vo";

/**
 * Entidade de domínio: User.
 * Identidade: id. Regras de negócio no domínio.
 */
export class User {
  private constructor(
    private readonly _id: string,
    private _email: Email,
    private _name: string,
    private _role: string,
    private _status: string,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date
  ) {}

  static create(id: string, email: Email, name: string, role: string = "user"): User {
    if (!name || name.trim().length === 0) {
      throw new Error("Name is required");
    }
    const now = new Date();
    return new User(id, email, name.trim(), role, "active", now, now);
  }

  static reconstitute(
    id: string,
    email: string,
    name: string,
    createdAt: Date,
    role: string = "user",
    status: string = "active",
    updatedAt: Date = createdAt
  ): User {
    return new User(id, Email.create(email), name, role, status, createdAt, updatedAt);
  }

  updateProfile(input: { email?: Email; name?: string; role?: string }): void {
    if (input.email) this._email = input.email;
    if (input.name !== undefined) {
      if (!input.name || input.name.trim().length === 0) {
        throw new Error("Name is required");
      }
      this._name = input.name.trim();
    }
    if (input.role !== undefined) this._role = input.role;
  }

  deactivate(): void {
    this._status = "inactive";
  }

  get id(): string {
    return this._id;
  }

  get email(): Email {
    return this._email;
  }

  get name(): string {
    return this._name;
  }

  get role(): string {
    return this._role;
  }

  get status(): string {
    return this._status;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
