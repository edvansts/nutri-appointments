/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { QueryInterface, DataTypes } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn(
      'ClinicalEvaluations',
      'otherReportedSymptoms',
      { type: DataTypes.STRING },
    );
  },

  down: async (queryInterface: QueryInterface) => {
    //
  },
};
