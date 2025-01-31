import React, { useEffect, useMemo, createContext } from 'react';
import { useForm, FormProvider, useFormContext, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// ----------------------------
// Type Definitions
// ----------------------------
type FieldName = string;
type FieldDependencies = Record<FieldName, FieldName[]>;

interface FieldConfig {
  name: FieldName;
  validation: yup.AnySchema;
  dependencies?: FieldName[];
  isActive?: (values: Record<string, unknown>) => boolean;
}

interface FormLogicConfig {
  fields: Record<FieldName, FieldConfig>;
  dependencies: FieldDependencies;
}

interface FormLayoutProps {
  children: React.ReactNode;
}

// ----------------------------
// Context & Providers
// ----------------------------
const FormLogicContext = createContext<{
  activeFields: Set<FieldName>;
  dependencies: FieldDependencies;
}>({ activeFields: new Set(), dependencies: {} });

const FormLogicProvider: React.FC<{ config: FormLogicConfig }> = ({ config, children }) => {
  const methods = useForm({
    resolver: yupResolver(buildValidationSchema(config)),
    mode: 'onChange'
  });

  const { watch, setValue } = methods;
  const values = watch();
  const activeFields = useMemo(() => calculateActiveFields(config, values), [config, values]);

  // Generic field dependency cleanup
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name && config.dependencies[name]) {
        config.dependencies[name].forEach(dependentField => {
          setValue(dependentField, '');
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue, config.dependencies]);

  return (
    <FormProvider {...methods}>
      <FormLogicContext.Provider value={{ activeFields, dependencies: config.dependencies }}>
        {children}
      </FormLogicContext.Provider>
    </FormProvider>
  );
};

// ----------------------------
// Custom Hooks
// ----------------------------
const useFormLogic = () => {
  const { activeFields, dependencies } = React.useContext(FormLogicContext);
  const { watch } = useFormContext();
  const values = watch();

  return {
    activeFields,
    dependencies,
    values
  };
};

// ----------------------------
// Layout Components
// ----------------------------
const FormField: React.FC<{ name: FieldName }> = ({ name }) => {
  const { activeFields } = useFormLogic();
  const { control } = useFormContext();

  if (!activeFields.has(name)) return null;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className="form-field">
          <input {...field} />
          {fieldState.error && <span>{fieldState.error.message}</span>}
        </div>
      )}
    />
  );
};

const FormContainer: React.FC<FormLayoutProps> = ({ children }) => (
  <div className="form-container">{children}</div>
);

// ----------------------------
// Helper Functions
// ----------------------------
const calculateActiveFields = (config: FormLogicConfig, values: Record<string, unknown>) => {
  return new Set(
    Object.entries(config.fields)
      .filter(([_, fieldConfig]) => 
        !fieldConfig.isActive || fieldConfig.isActive(values)
      )
      .map(([name]) => name)
  );
};

const buildValidationSchema = (config: FormLogicConfig) => {
  const shape = Object.entries(config.fields).reduce((acc, [name, field]) => {
    acc[name] = field.validation;
    return acc;
  }, {} as Record<string, yup.AnySchema>);

  return yup.object().shape(shape);
};

// ----------------------------
// Usage Example
// ----------------------------
const formLogicConfig: FormLogicConfig = {
  fields: {
    firstName: {
      name: 'firstName',
      validation: yup.string().required('First name is required'),
      dependencies: ['email']
    },
    email: {
      name: 'email',
      validation: yup.string().email().required(),
      isActive: (values) => !!values.firstName
    },
    userType: {
      name: 'userType',
      validation: yup.string().required(),
      dependencies: ['companyName']
    },
    companyName: {
      name: 'companyName',
      validation: yup.string().when('userType', {
        is: 'business',
        then: yup.string().required()
      })
    }
  },
  dependencies: {
    firstName: ['email'],
    userType: ['companyName']
  }
};

const AppLayout = () => (
  <FormContainer>
    <div className="form-section">
      <h2>Personal Information</h2>
      <FormField name="firstName" />
      <FormField name="email" />
    </div>

    <div className="form-section">
      <h2>Business Information</h2>
      <FormField name="userType" />
      <FormField name="companyName" />
    </div>
  </FormContainer>
);

const App = () => (
  <FormLogicProvider config={formLogicConfig}>
    <AppLayout />
  </FormLogicProvider>
);
