import React, { useMemo, useState } from 'react';
import { useForm, Controller, Control } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

interface FormValues {
  firstName?: string;
  email?: string;
  userType?: 'personal' | 'business';
  companyName?: string;
  preferences?: string[];
}

interface FieldConfig {
  name: keyof FormValues;
  label: string;
  type: string;
  options?: string[];
  validation: yup.AnySchema;
  nextStepCondition?: (values: FormValues) => boolean;
}

const formConfig: FieldConfig[] = [
  {
    name: 'firstName',
    label: 'First Name',
    type: 'text',
    validation: yup.string().required('First name is required'),
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    validation: yup.string().email('Invalid email').required('Email is required'),
  },
  {
    name: 'userType',
    label: 'User Type',
    type: 'select',
    options: ['personal', 'business'],
    validation: yup.string().required('User type is required'),
    nextStepCondition: (values) => values.userType === 'business',
  },
  {
    name: 'companyName',
    label: 'Company Name',
    type: 'text',
    validation: yup.string().when('userType', {
      is: 'business',
      then: (schema) => schema.required('Company name is required for business users'),
    }),
  },
  {
    name: 'preferences',
    label: 'Preferences',
    type: 'checkbox',
    options: ['newsletter', 'updates', 'offers'],
    validation: yup.array().min(1, 'Select at least one preference'),
  },
];

const buildValidationSchema = (currentStep: number, values: FormValues) => {
  const currentField = formConfig[currentStep];
  const schemaObject = formConfig.slice(0, currentStep + 1).reduce((acc, field) => {
    acc[field.name] = field.validation;
    return acc;
  }, {} as Record<keyof FormValues, yup.AnySchema>);

  return yup.object().shape(schemaObject).test(
    'conditional-validation',
    'Skip validation for hidden fields',
    (value) => {
      // Custom logic to skip validation for fields that are conditionally hidden
      return formConfig.every((field, index) => {
        if (index > currentStep) return true;
        if (field.nextStepCondition && !field.nextStepCondition(values)) return true;
        return schemaObject[field.name].isValidSync(value[field.name]);
      });
    }
  );
};

const ProgressiveForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([0]));

  const { control, handleSubmit, watch, trigger, formState } = useForm<FormValues>({
    resolver: yupResolver(buildValidationSchema(currentStep, watch())),
    mode: 'onChange',
  });

  const values = watch();
  const isFinalStep = currentStep === formConfig.length - 1;

  const shouldShowField = (index: number): boolean => {
    if (index > currentStep) return false;
    const field = formConfig[index];
    return !field.nextStepCondition || field.nextStepCondition(values);
  };

  const progressToNextStep = async () => {
    const isValid = await trigger(formConfig[currentStep].name as any);
    if (isValid && currentStep < formConfig.length - 1) {
      setCurrentStep(prev => Math.min(prev + 1, formConfig.length - 1));
      setVisitedSteps(prev => new Set([...prev, currentStep + 1]));
    }
  };

  const renderField = (config: FieldConfig, index: number) => {
    if (!shouldShowField(index) || !visitedSteps.has(index)) return null;

    return (
      <div key={config.name} className="form-field">
        <Controller
          name={config.name}
          control={control}
          render={({ field, fieldState }) => (
            <>
              <label>{config.label}</label>
              {config.type === 'select' ? (
                <select {...field} onChange={(e) => { field.onChange(e); progressToNextStep(); }}>
                  <option value="">Select...</option>
                  {config.options?.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : config.type === 'checkbox' ? (
                <div>
                  {config.options?.map(option => (
                    <label key={option}>
                      <input
                        type="checkbox"
                        value={option}
                        checked={field.value?.includes(option)}
                        onChange={(e) => {
                          const newValue = e.target.checked
                            ? [...(field.value || []), option]
                            : (field.value || []).filter((v: string) => v !== option);
                          field.onChange(newValue);
                          progressToNextStep();
                        }}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              ) : (
                <input
                  {...field}
                  type={config.type}
                  onChange={(e) => { field.onChange(e); progressToNextStep(); }}
                />
              )}
              {fieldState.error && <span className="error">{fieldState.error.message}</span>}
            </>
          )}
        />
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      {formConfig.map((config, index) => renderField(config, index))}
      
      {isFinalStep && formState.isValid && (
        <button type="submit">Submit</button>
      )}
    </form>
  );
};

export default ProgressiveForm;