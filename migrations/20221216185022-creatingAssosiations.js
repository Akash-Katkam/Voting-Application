"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn("Voters", "EId", {
      type: Sequelize.DataTypes.INTEGER,
    }),
      await queryInterface.addConstraint("Voters", {
        fields: ["EId"],
        type: "foreign key",
        name: "custom_fkey_electionId",
        onDelete: "CASCADE",
        references: {
          table: "Elections",
          field: "id",
        },
      }),
      await queryInterface.addColumn("Elections", "UId", {
        type: Sequelize.DataTypes.INTEGER,
      });

    await queryInterface.addConstraint("Elections", {
      fields: ["UId"],
      type: "foreign key",
      name: "custom_fkey_userId",
      onDelete: "CASCADE",
      references: {
        table: "ElectionAdmins",
        field: "id",
      },
    }),
      await queryInterface.addColumn("Questions", "EId", {
        type: Sequelize.DataTypes.INTEGER,
      }),
      await queryInterface.addConstraint("Questions", {
        fields: ["EId"],
        type: "foreign key",
        name: "custom_fkey_electionId",
        onDelete: "CASCADE",
        references: {
          table: "Elections",
          field: "id",
        },
      }),
      await queryInterface.addColumn("Options", "QId", {
        type: Sequelize.DataTypes.INTEGER,
      }),
      await queryInterface.addConstraint("Options", {
        fields: ["QId"],
        type: "foreign key",
        name: "custom_fkey_questionId",
        onDelete: "CASCADE",
        references: {
          table: "Questions",
          field: "id",
        },
      }),
      await queryInterface.addColumn("Votes", "QId", {
        type: Sequelize.DataTypes.INTEGER,
      }),
      await queryInterface.addConstraint("Votes", {
        fields: ["QId"],
        type: "foreign key",
        name: "custom_fkey_questionId",
        onDelete: "CASCADE",
        references: {
          table: "Questions",
          field: "id",
        },
      }),
      await queryInterface.addColumn("Votes", "OId", {
        type: Sequelize.DataTypes.INTEGER,
      });

    await queryInterface.addConstraint("Votes", {
      fields: ["OId"],
      type: "foreign key",
      name: "custom_fkey_optionId",
      onDelete: "CASCADE",
      references: {
        table: "Options",
        field: "id",
      },
    });

    await queryInterface.addColumn("Votes", "VId", {
      type: Sequelize.DataTypes.INTEGER,
    });

    await queryInterface.addConstraint("Votes", {
      fields: ["VId"],
      type: "foreign key",
      name: "custom_fkey_voterId",
      onDelete: "CASCADE",
      references: {
        table: "Voters",
        field: "id",
      },
    });
  },

  // eslint-disable-next-line no-unused-vars
  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("voters", "EId");
    await queryInterface.removeColumn("Elections", "UId");
    await queryInterface.removeColumn("Questions", "EId");
    await queryInterface.removeColumn("Options", "QId");
    await queryInterface.removeColumn("Votes", "QId");
    await queryInterface.removeColumn("Votes", "OId");
    await queryInterface.removeColumn("Votes", "VId");
  },
};
