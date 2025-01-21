// src/domain/entities/User.ts
import { Entity } from './Entity';

export class User extends Entity {
  constructor(
    id: string,
    private readonly email: string,
    private readonly name: string,
    private readonly password: string,
    private readonly createdAt: Date,
    private readonly updatedAt: Date
  ) {
    super(id);
  }

  getEmail(): string {
    return this.email;
  }

  getName(): string {
    return this.name;
  }

  getPassword(): string {
    return this.password;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
