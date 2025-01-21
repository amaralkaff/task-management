// src/__tests__/unit/LocalFileStorageService.test.ts
import path from 'path';
import { LocalFileStorageService } from '../../infrastructure/storage/LocalFileStorageService';

jest.mock('fs/promises', () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
  unlink: jest.fn(),
  access: jest.fn(),
}));

const mockExistsSync = jest.fn();
const mockReaddirSync = jest.fn();
const mockUnlinkSync = jest.fn();
const mockRmdirSync = jest.fn();
const mockReadFileSync = jest.fn();

jest.mock('fs', () => ({
  existsSync: mockExistsSync,
  readdirSync: mockReaddirSync,
  unlinkSync: mockUnlinkSync,
  rmdirSync: mockRmdirSync,
  readFileSync: mockReadFileSync,
}));

describe('LocalFileStorageService', () => {
  const service = new LocalFileStorageService();
  const testFilename = 'test.txt';
  const testContent = Buffer.from('test content');
  const uploadsDir = path.join(process.cwd(), 'uploads');

  const fsPromises = require('fs/promises');

  beforeEach(() => {
    jest.clearAllMocks();
    fsPromises.mkdir.mockResolvedValue(undefined);
    fsPromises.writeFile.mockResolvedValue(undefined);
    fsPromises.unlink.mockResolvedValue(undefined);
    fsPromises.access.mockResolvedValue(undefined);
    mockExistsSync.mockReturnValue(true);
    mockReaddirSync.mockReturnValue([]);
  });

  test('should store file successfully', async () => {
    const savedPath = await service.store(testFilename, testContent);
    expect(savedPath).toBeDefined();
    expect(fsPromises.mkdir).toHaveBeenCalledWith(uploadsDir, {
      recursive: true,
    });
    expect(fsPromises.writeFile).toHaveBeenCalledWith(
      expect.stringContaining(testFilename),
      testContent
    );
  });

  test('should generate unique filename', async () => {
    // Mock Date.now() untuk menghasilkan timestamp yang berbeda
    const originalDateNow = Date.now;
    Date.now = jest.fn().mockReturnValueOnce(1000).mockReturnValueOnce(2000);

    const path1 = await service.store(testFilename, testContent);
    const path2 = await service.store(testFilename, testContent);

    expect(path1).not.toBe(path2);
    expect(path1).toContain('1000');
    expect(path2).toContain('2000');

    // Restore Date.now
    Date.now = originalDateNow;
  });

  test('should delete file successfully', async () => {
    const savedPath = await service.store(testFilename, testContent);
    await service.delete(savedPath);
    expect(fsPromises.unlink).toHaveBeenCalledWith(savedPath);
  });

  test('should handle non-existent file deletion gracefully', async () => {
    const nonExistentPath = path.join(uploadsDir, 'non-existent.txt');
    fsPromises.unlink.mockRejectedValue({ code: 'ENOENT' });
    await expect(service.delete(nonExistentPath)).resolves.not.toThrow();
  });

  test('should throw error when directory creation fails', async () => {
    const error = new Error('Permission denied');
    fsPromises.mkdir.mockRejectedValue(error);

    await expect(service.store(testFilename, testContent)).rejects.toThrow(
      'Permission denied'
    );
    expect(fsPromises.mkdir).toHaveBeenCalledWith(uploadsDir, {
      recursive: true,
    });
  });

  test('should throw error when file write fails', async () => {
    const error = new Error('Disk full');
    fsPromises.writeFile.mockRejectedValue(error);

    await expect(service.store(testFilename, testContent)).rejects.toThrow(
      'Disk full'
    );
    expect(fsPromises.mkdir).toHaveBeenCalledWith(uploadsDir, {
      recursive: true,
    });
    expect(fsPromises.writeFile).toHaveBeenCalledWith(
      expect.stringContaining(testFilename),
      testContent
    );
  });

  test('should throw error when file deletion fails with non-ENOENT error', async () => {
    const error = new Error('Permission denied');
    fsPromises.unlink.mockRejectedValue(error);

    await expect(service.delete('test.txt')).rejects.toThrow(
      'Permission denied'
    );
    expect(fsPromises.unlink).toHaveBeenCalledWith('test.txt');
  });

  test('should check if file exists', async () => {
    await expect(service.exists('test.txt')).resolves.toBe(true);
    expect(fsPromises.access).toHaveBeenCalledWith('test.txt');
  });

  test('should return false when file does not exist', async () => {
    fsPromises.access.mockRejectedValue(new Error('File not found'));
    await expect(service.exists('non-existent.txt')).resolves.toBe(false);
    expect(fsPromises.access).toHaveBeenCalledWith('non-existent.txt');
  });

  test('should handle empty content', async () => {
    const emptyContent = Buffer.from('');
    const savedPath = await service.store(testFilename, emptyContent);
    expect(savedPath).toBeDefined();
    expect(fsPromises.writeFile).toHaveBeenCalledWith(
      expect.stringContaining(testFilename),
      emptyContent
    );
  });

  test('should handle special characters in filename', async () => {
    const specialFilename = 'test@#$%^&*.txt';
    const savedPath = await service.store(specialFilename, testContent);
    expect(savedPath).toBeDefined();
    expect(fsPromises.writeFile).toHaveBeenCalledWith(
      expect.stringContaining(specialFilename),
      testContent
    );
  });

  test("should create uploads directory if it doesn't exist", async () => {
    mockExistsSync.mockReturnValue(false);

    const savedPath = await service.store(testFilename, testContent);
    expect(fsPromises.mkdir).toHaveBeenCalledWith(uploadsDir, {
      recursive: true,
    });
    expect(savedPath).toBeDefined();
    expect(fsPromises.writeFile).toHaveBeenCalledWith(
      expect.stringContaining(testFilename),
      testContent
    );
  });
});
