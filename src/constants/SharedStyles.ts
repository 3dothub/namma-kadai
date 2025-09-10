import { StyleSheet } from 'react-native';
import { currentTheme } from './Colors';

// Shared styles for consistent UI across auth pages
export const sharedStyles = StyleSheet.create({
  // Input styles
  inputGroup: {
    marginBottom: 16, // Reduced margin
  },
  label: {
    fontSize: 14,
    color: currentTheme.textPrimary,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent', // Remove background
    borderRadius: 0, // Remove border radius
    paddingHorizontal: 0, // Remove horizontal padding
    paddingVertical: 8, // Minimal vertical padding
    borderWidth: 0, // Remove border
    borderBottomWidth: 1, // Only bottom border
    borderBottomColor: currentTheme.inputBorder,
  },
  signInActionsContainer:{
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24, // Reduced margin
  },
  inputContainerActive: {
    borderBottomColor: currentTheme.primary, // Green when active
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: currentTheme.textPrimary,
  },
  eyeButton: {
    padding: 4, // Reduced padding
  },

  // Button styles
  primaryButton: {
    backgroundColor: currentTheme.primary,
    paddingVertical: 14, // Reduced padding
    borderRadius: 8, // Smaller radius
    alignItems: 'center',
    marginTop: 16, // Reduced margin
    shadowColor: currentTheme.primary,
    shadowOffset: {
      width: 0,
      height: 2, // Reduced shadow
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: currentTheme.textOnPrimary,
    fontSize: 16,
    fontWeight: '600', // Reduced weight
  },

  // Link styles
  footer: {
    alignItems: 'flex-start', // Left align like other content
    justifyContent: 'flex-end',
    marginTop: 0,
  },
  footerText: {
    fontSize: 16,
    color: currentTheme.textSecondary,
    textAlign: 'center', // Left align
  },
  linkText: {
    color: currentTheme.primary,
    fontWeight: '700',
  },

  // Common container styles
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 40,
  },
  
  // Form styles
  form: {
    marginBottom: 20, // Reduced margin for tighter layout
  },
  header: {
    marginBottom: 0, // Remove bottom margin since title has its own
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: currentTheme.textPrimary,
    marginBottom: 8,
  },

  // Options row (for remember me, forgot password etc)
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24, // Reduced margin
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: currentTheme.inputBorder,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: currentTheme.primary,
    borderColor: currentTheme.primary,
  },
  optionText: {
    fontSize: 14,
    color: currentTheme.textSecondary,
  },
  linkButton: {
    fontSize: 14,
    color: currentTheme.primary,
    fontWeight: '500',
  },
});
