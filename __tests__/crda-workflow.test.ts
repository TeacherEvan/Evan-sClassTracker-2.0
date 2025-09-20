/**
 * Test to validate the CRDA workflow configuration
 * This ensures the workflow has the necessary permissions to run successfully
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

describe('CRDA Workflow Configuration', () => {
  const workflowPath = path.join(__dirname, '..', '.github', 'workflows', 'crda.yml');
  
  test('workflow file exists', () => {
    expect(fs.existsSync(workflowPath)).toBe(true);
  });

  test('workflow has required permissions for PR scanning', () => {
    const workflowContent = fs.readFileSync(workflowPath, 'utf8');
    const workflow = yaml.load(workflowContent) as any;
    
    // Check that the job has the necessary permissions
    const crdaScanJob = workflow.jobs['crda-scan'];
    expect(crdaScanJob).toBeDefined();
    expect(crdaScanJob.permissions).toBeDefined();
    
    // Verify all required permissions are present
    expect(crdaScanJob.permissions['contents']).toBe('read');
    expect(crdaScanJob.permissions['security-events']).toBe('write');
    expect(crdaScanJob.permissions['pull-requests']).toBe('write');
    expect(crdaScanJob.permissions['issues']).toBe('write');
  });

  test('workflow is configured for pull_request_target events', () => {
    const workflowContent = fs.readFileSync(workflowPath, 'utf8');
    const workflow = yaml.load(workflowContent) as any;
    
    expect(workflow.on['pull_request_target']).toBeDefined();
    expect(workflow.on['pull_request_target'].branches).toContain('main');
  });

  test('workflow uses correct CRDA action version', () => {
    const workflowContent = fs.readFileSync(workflowPath, 'utf8');
    const workflow = yaml.load(workflowContent) as any;
    
    const steps = workflow.jobs['crda-scan'].steps;
    const crdaStep = steps.find((step: any) => step.uses && step.uses.includes('redhat-actions/crda'));
    
    expect(crdaStep).toBeDefined();
    expect(crdaStep.uses).toBe('redhat-actions/crda@v1');
  });
});