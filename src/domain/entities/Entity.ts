// src/domain/entities/Entity.ts
export abstract class Entity {
  constructor(protected readonly id: string) {}

  getId(): string {
    return this.id;
  }
}
