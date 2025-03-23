#!/bin/bash
# Script to test DyndbClient with different credential configurations

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===================================${NC}"
echo -e "${BLUE}   DyndbClient Credential Tester   ${NC}"
echo -e "${BLUE}===================================${NC}"

# Compile TypeScript first
echo -e "\n${YELLOW}Compiling TypeScript...${NC}"
npm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}TypeScript compilation failed. Please fix errors and try again.${NC}"
  exit 1
fi
echo -e "${GREEN}Compilation successful!${NC}"

# Function to run the test with a specific profile
run_test_with_profile() {
  local profile=$1
  
  echo -e "\n${BLUE}===================================${NC}"
  echo -e "${BLUE}   Testing with profile: ${profile:-default}   ${NC}"
  echo -e "${BLUE}===================================${NC}"
  
  if [ -z "$profile" ]; then
    # Run with default credentials
    node dist/test-credentials.js
  else
    # Run with specified profile
    AWS_PROFILE=$profile node dist/test-credentials.js
  fi
}

# Function to run the test with explicit credentials
run_test_with_explicit_credentials() {
  echo -e "\n${BLUE}===================================${NC}"
  echo -e "${BLUE}   Testing with explicit credentials   ${NC}"
  echo -e "${BLUE}===================================${NC}"
  
  read -p "Enter AWS Access Key ID: " access_key
  read -sp "Enter AWS Secret Access Key: " secret_key
  echo -e "\n"
  read -p "Enter AWS Region (default: us-east-1): " region
  
  export AWS_ACCESS_KEY_ID=$access_key
  export AWS_SECRET_ACCESS_KEY=$secret_key
  export AWS_REGION=${region:-us-east-1}
  
  echo -e "\n${YELLOW}Running test with provided credentials...${NC}"
  node dist/test-credentials.js
  
  # Unset the credentials after the test
  unset AWS_ACCESS_KEY_ID
  unset AWS_SECRET_ACCESS_KEY
  unset AWS_REGION
}

# Main menu
while true; do
  echo -e "\n${YELLOW}Select a test option:${NC}"
  echo "1) Test with default AWS credentials"
  echo "2) Test with a specific AWS profile"
  echo "3) Test with explicit credentials"
  echo "4) Exit"
  read -p "Enter your choice (1-4): " choice
  
  case $choice in
    1)
      run_test_with_profile
      ;;
    2)
      read -p "Enter AWS profile name: " profile_name
      run_test_with_profile "$profile_name"
      ;;
    3)
      run_test_with_explicit_credentials
      ;;
    4)
      echo -e "${GREEN}Exiting the credential tester.${NC}"
      exit 0
      ;;
    *)
      echo -e "${RED}Invalid choice. Please try again.${NC}"
      ;;
  esac
done 