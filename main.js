// index.js - Main script to handle subdomain registration via GitHub Actions

const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');
const yaml = require('js-yaml');

const OWNER = process.env.GITHUB_REPOSITORY_OWNER;
const REPO = process.env.GITHUB_REPOSITORY.split('/')[1];
const TOKEN = process.env.GITHUB_TOKEN;
const LABEL_NAME = 'approved';
const octokit = new Octokit({ auth: TOKEN });

async function processPullRequests() {
    try {
        const { data: pulls } = await octokit.pulls.list({
            owner: OWNER,
            repo: REPO,
            state: 'open'
        });
        
        for (const pr of pulls) {
            const { data: labels } = await octokit.issues.listLabelsOnIssue({
                owner: OWNER,
                repo: REPO,
                issue_number: pr.number
            });
            
            if (labels.some(label => label.name === LABEL_NAME)) {
                console.log(`Processing approved PR: #${pr.number}`);
                await mergePullRequest(pr.number);
            }
        }
    } catch (error) {
        console.error('Error processing PRs:', error);
    }
}

async function mergePullRequest(prNumber) {
    try {
        await octokit.pulls.merge({
            owner: OWNER,
            repo: REPO,
            pull_number: prNumber
        });
        console.log(`Merged PR #${prNumber}`);
    } catch (error) {
        console.error(`Error merging PR #${prNumber}:`, error);
    }
}

processPullRequests();
