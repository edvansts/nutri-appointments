/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { QueryInterface, DataTypes } from 'sequelize';
import { ALCOHOLIC_STATUS, SMOKER_STATUS } from 'src/constants/enum';

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface
      .changeColumn('ClinicalEvaluations', 'smokerStatus', {
        type: DataTypes.STRING,
      })
      // 2. Drop the enum
      .then(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const pgEnumDropQuery = queryInterface.queryGenerator.pgEnumDrop(
          'ClinicalEvaluations',
          'smokerStatus',
        );
        return queryInterface.sequelize.query(pgEnumDropQuery);
      })
      // 3. Create the enum with the new values
      .then(() => {
        return queryInterface.changeColumn(
          'ClinicalEvaluations',
          'smokerStatus',
          {
            type: DataTypes.ENUM,
            values: Object.values(SMOKER_STATUS),
          },
        );
      });

    await queryInterface
      .changeColumn('ClinicalEvaluations', 'alcoholicStatus', {
        type: DataTypes.STRING,
      })
      // 2. Drop the enum
      .then(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const pgEnumDropQuery = queryInterface.queryGenerator.pgEnumDrop(
          'ClinicalEvaluations',
          'alcoholicStatus',
        );
        return queryInterface.sequelize.query(pgEnumDropQuery);
      })
      // 3. Create the enum with the new values
      .then(() => {
        return queryInterface.changeColumn(
          'ClinicalEvaluations',
          'alcoholicStatus',
          {
            type: DataTypes.ENUM,
            values: Object.values(ALCOHOLIC_STATUS),
          },
        );
      });
  },

  down: async (queryInterface: QueryInterface) => {
    //
  },
};
