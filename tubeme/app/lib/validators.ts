import { Result } from '../types';
import { success, failure } from './result';

export function validateTopic(topic: string): Result<string> {
  const trimmed = topic.trim();
  if (!trimmed) {
    return failure('Topic cannot be empty');
  }
  if (trimmed.length > 500) {
    return failure('Topic must be less than 500 characters');
  }
  return success(trimmed);
}

export function validateText(text: string): Result<string> {
  if (text.length > 200) {
    return failure('Text must be less than 200 characters');
  }
  return success(text);
}

export function validateApiKey(key: string): Result<string> {
  const trimmed = key.trim();
  if (!trimmed) {
    return failure('API key cannot be empty');
  }
  if (trimmed.length < 10) {
    return failure('API key appears to be invalid');
  }
  return success(trimmed);
}

export function validateImageFile(file: File): Result<File> {
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  if (!validTypes.includes(file.type)) {
    return failure('Only PNG and JPEG images are supported');
  }
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return failure('Image must be less than 5MB');
  }
  return success(file);
}
