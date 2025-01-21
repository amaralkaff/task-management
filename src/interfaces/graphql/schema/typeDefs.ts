// src/interfaces/graphql/schema/typeDefs.ts
export const typeDefs = `#graphql
  scalar DateTime
  scalar Upload

  type User {
    id: ID!
    email: String!
    name: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Task {
    id: ID!
    title: String!
    description: String
    status: TaskStatus!
    dueDate: DateTime
    user: User
    files: [File!]
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type File {
    id: ID!
    filename: String!
    mimetype: String!
    size: Int!
    createdAt: DateTime!
  }

  enum TaskStatus {
    pending
    in_progress
    completed
  }

  enum SortOrder {
    ASC
    DESC
  }

  enum TaskSortField {
    TITLE
    DUE_DATE
    STATUS
    CREATED_AT
  }

  input TaskFilterInput {
    filterByStatus: TaskStatus
    filterByDueDate: DateTime
    search: String
    sortBy: TaskSortField
    sortOrder: SortOrder
  }

  type AuthResponse {
    token: String!
    user: User!
  }

  input RegisterInput {
    email: String!
    password: String!
    name: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input CreateTaskInput {
    title: String!
    description: String
    status: TaskStatus!
    dueDate: String
  }

  input UpdateTaskInput {
    title: String
    description: String
    status: TaskStatus
    dueDate: String
  }

  type Query {
    me: User!
    tasks(filter: TaskFilterInput): [Task!]!
    task(id: ID!): Task!
  }

  type Mutation {
    register(input: RegisterInput!): AuthResponse!
    login(input: LoginInput!): AuthResponse!
    
    createTask(input: CreateTaskInput!): Task!
    updateTask(id: ID!, input: UpdateTaskInput!): Task!
    deleteTask(id: ID!): Boolean!
    
    uploadTaskFile(taskId: ID!, file: Upload!): File!
    deleteFile(id: ID!): Boolean!
  }
`;
