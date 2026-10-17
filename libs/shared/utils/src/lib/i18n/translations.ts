export type Language = 'en' | 'fr';

export const enTranslations = {
  employee: {
    list: {
      title: 'Employee Directory',
      subtitle: 'Manage employee records, departments, and salaries',
      addEmployee: '+ Add Employee',
      loading: 'Loading employees...',
      noEmployeesFound: 'No employees found.',
      addFirstEmployee: 'Add the first employee',
      table: {
        id: 'ID',
        name: 'Name',
        department: 'Department',
        salary: 'Salary',
        actions: 'Actions',
      },
      actions: {
        viewTitle: 'View details',
        view: 'View',
        editTitle: 'Edit employee',
        edit: 'Edit',
        deleteTitle: 'Delete employee',
        delete: 'Delete',
        deleting: 'Deleting...',
      },
      confirmDelete: 'Are you sure you want to delete {{name}} {{lastName}}?',
      errors: {
        loadFailed: 'Failed to load employees.',
        deleteFailed: 'Failed to delete employee.',
      },
      pagination: {
        showing: 'Showing {{start}} to {{end}} of {{total}} employees',
        page: 'Page {{page}} of {{totalPages}}',
        pageSize: 'Per page',
        previous: 'Previous',
        next: 'Next',
        first: 'First',
        last: 'Last',
      },
    },
  },
} as const;

export const frTranslations = {
  employee: {
    list: {
      title: 'Annuaire des Employés',
      subtitle: 'Gérez les dossiers des employés, les départements et les salaires',
      addEmployee: '+ Ajouter un Employé',
      loading: 'Chargement des employés...',
      noEmployeesFound: 'Aucun employé trouvé.',
      addFirstEmployee: 'Ajouter le premier employé',
      table: {
        id: 'ID',
        name: 'Nom',
        department: 'Département',
        salary: 'Salaire',
        actions: 'Actions',
      },
      actions: {
        viewTitle: 'Voir les détails',
        view: 'Voir',
        editTitle: "Modifier l'employé",
        edit: 'Modifier',
        deleteTitle: "Supprimer l'employé",
        delete: 'Supprimer',
        deleting: 'Suppression en cours...',
      },
      confirmDelete: 'Êtes-vous sûr de vouloir supprimer {{name}} {{lastName}} ?',
      errors: {
        loadFailed: 'Échec du chargement des employés.',
        deleteFailed: "Échec de la suppression de l'employé.",
      },
      pagination: {
        showing: 'Affichage de {{start}} à {{end}} sur {{total}} employés',
        page: 'Page {{page}} sur {{totalPages}}',
        pageSize: 'Par page',
        previous: 'Précédent',
        next: 'Suivant',
        first: 'Premier',
        last: 'Dernier',
      },
    },
  },
} as const;

export const translations: Record<Language, Record<string, unknown>> = {
  en: enTranslations,
  fr: frTranslations,
};
