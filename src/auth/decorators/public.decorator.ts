import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC = 'IS_PUBLIC';

export function Public() {
  return SetMetadata(IS_PUBLIC, true);
}
