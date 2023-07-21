import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { Person } from 'src/models/person.model';

@Injectable()
export class PersonService {
  constructor(@InjectModel(Person) private personModel: typeof Person) {}

  async create(
    data: { name: string; cpf: string; birthdayDate: Date },
    transaction?: Transaction,
  ) {
    const { cpf, name, birthdayDate } = data;

    const newPerson = await this.personModel.create(
      { name, cpf, birthdayDate },
      { transaction },
    );

    return newPerson.toJSON();
  }

  async findByCpf(cpf: string) {
    return this.personModel.findOne({ where: { cpf } });
  }
}
