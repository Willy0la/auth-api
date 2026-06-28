import { registerDecorator, ValidationArguments } from 'class-validator';

export function AtLeastOneOf(...fields: string[]) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'atLeastOneOf',
      target: object.constructor,
      propertyName: propertyName,
      validator: {
        validate(_: any, args: ValidationArguments) {
          return fields.some(
            (field) => (args.object as any)[field] !== undefined,
          );
        },
        defaultMessage() {
          return `At least one of ${fields.join(', ')} must be provided`;
        },
      },
    });
  };
}
