import * as yup from 'yup';

// Standard Indian GSTIN Regex
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export const invoiceFormSchema = yup.object().shape({
  invoiceNumber: yup.string().required('Invoice number is required'),
  invoiceDate: yup.string().required('Invoice date is required'),
  dueDate: yup.string()
    .required('Due date is required')
    .test(
      'is-after-or-equal',
      'Due date must be after or equal to invoice date',
      function (value) {
        const { invoiceDate } = this.parent;
        if (!invoiceDate || !value) return true; // skip if either is missing, handled by required
        return new Date(value) >= new Date(invoiceDate);
      }
    ),
  seller: yup.object().shape({
    name: yup.string().required('Seller name is required'),
    address: yup.string(),
    gstin: yup.string()
      .required('Seller GSTIN is required')
      .matches(GSTIN_REGEX, 'Invalid GSTIN format (e.g., 27ABCDE1234F1Z5)'),
  }),
  buyer: yup.object().shape({
    name: yup.string().required('Buyer name is required'),
    address: yup.string(),
    gstin: yup.string()
      .required('Buyer GSTIN is required')
      .matches(GSTIN_REGEX, 'Invalid GSTIN format (e.g., 27ABCDE1234F1Z5)'),
  }),
  items: yup.array()
    .of(
      yup.object().shape({
        id: yup.string().required(),
        quantity: yup.number().required().min(1, 'Quantity must be at least 1'),
      })
    )
    .min(1, 'Please add at least one item')
    .required('Please add at least one item'),
});

// Type for our form values inferred from the schema
export type InvoiceFormValues = yup.InferType<typeof invoiceFormSchema>;
