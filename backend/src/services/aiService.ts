import { openai, isAiMockMode } from '../config/openai';

export interface MilestoneInput {
  title: string;
  description: string;
  orderIndex: number;
  weeksDuration: number;
  tasks: Array<{
    title: string;
    description: string;
    estimatedMinutes: number;
    orderIndex: number;
  }>;
  resources: Array<{
    title: string;
    type: string;
    url: string;
    rationale: string;
  }>;
}

export interface RoadmapResponse {
  title: string;
  description: string;
  milestones: MilestoneInput[];
}

export interface LearningContentResponse {
  content: string;
  practiceTasks: Array<{ title: string; description: string; }>;
  quiz: Array<{
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
  }>;
}

export class AIService {
  
  public static async generateRoadmap(
    goal: string,
    durationMonths: number,
    knowledgeLevel: string,
    hoursPerDay: number,
    learningStyle: string
  ): Promise<RoadmapResponse> {
    if (isAiMockMode) {
      console.log('OpenAI key absent or mock mode enabled. Generating mock roadmap...');
      return this.generateMockRoadmap(goal, durationMonths, knowledgeLevel, learningStyle);
    }

    try {
      const prompt = `
        You are an expert curriculum designer and system architect.
        Decompose the user's career/life goal into a structured milestone roadmap.
        Goal: "${goal}"
        Target Duration: ${durationMonths} months.
        Current Knowledge Level: "${knowledgeLevel}".
        User Available Study Hours Per Day: ${hoursPerDay} hours.
        Preferred Learning Style: "${learningStyle}".

        Generate a JSON object conforming exactly to this structure:
        {
          "title": "Goal Title",
          "description": "Short explanation of the learning path.",
          "milestones": [
            {
              "title": "Milestone Title",
              "description": "Focus of this milestone.",
              "orderIndex": 1,
              "weeksDuration": 4,
              "tasks": [
                {
                  "title": "Task title",
                  "description": "Concrete action/study topic.",
                  "estimatedMinutes": 120,
                  "orderIndex": 1
                }
              ],
              "resources": [
                {
                  "title": "Resource Name",
                  "type": "course/book/youtube/documentation",
                  "url": "https://example.com/resource-link",
                  "rationale": "Why this matches the user's style"
                }
              ]
            }
          ]
        }
        Return ONLY the valid JSON block. Do not include markdown wraps like \`\`\`json.
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      });

      const responseText = response.choices[0].message.content || '{}';
      return JSON.parse(responseText) as RoadmapResponse;

    } catch (error) {
      console.error('Error generating AI roadmap, falling back to mock:', error);
      return this.generateMockRoadmap(goal, durationMonths, knowledgeLevel, learningStyle);
    }
  }

  public static async generateLearningContent(
    milestoneTitle: string,
    goalTitle: string
  ): Promise<LearningContentResponse> {
    if (isAiMockMode) {
      return this.generateMockLearningContent(milestoneTitle);
    }

    try {
      const prompt = `
        You are an expert tutor teaching the topic: "${milestoneTitle}" as part of the broader goal: "${goalTitle}".
        Please generate beginner-friendly learning material.

        Generate a JSON object conforming exactly to this structure:
        {
          "content": "A detailed 3-4 paragraph markdown-formatted explanation of the core concepts, including key objectives and a summary.",
          "practiceTasks": [
            {
              "title": "Task title",
              "description": "Short description of the practice task"
            }
          ],
          "quiz": [
            {
              "question": "Question text",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correctAnswerIndex": 0,
              "explanation": "Why this is correct"
            }
          ]
        }
        
        Requirements:
        - Provide 3-5 practiceTasks.
        - Provide exactly 5 quiz questions.
        - Ensure options are realistic and correctAnswerIndex is a number between 0 and 3.
        - Return ONLY the valid JSON block.
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const responseText = response.choices[0].message.content || '{}';
      return JSON.parse(responseText) as LearningContentResponse;
    } catch (error) {
      console.error('Error generating learning content, falling back to mock:', error);
      return this.generateMockLearningContent(milestoneTitle);
    }
  }

  public static async getMentorResponse(
    goalTitle: string,
    activeMilestone: string,
    completedTasks: string[],
    pendingTasks: string[],
    userMessage: string
  ): Promise<string> {
    if (isAiMockMode) {
      return `[MOCK AI MENTOR] That is a great question regarding your goal "${goalTitle}". In this stage (${activeMilestone}), I recommend focusing on practical exercises. If you need details on specific functions or concepts, feel free to ask. (Set up your OPENAI_API_KEY to get real interactive answers!)`;
    }

    try {
      const context = `
        You are a highly supportive and technical AI Mentor helping a user achieve their life goal: "${goalTitle}".
        Current Milestone focus: "${activeMilestone}".
        Tasks Completed: ${JSON.stringify(completedTasks)}.
        Pending Tasks: ${JSON.stringify(pendingTasks)}.

        Be encouraging, explain concepts clearly, suggest high-quality learning resources, and answer their queries accurately based on this context.
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: context },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
      });

      return response.choices[0].message.content || 'I apologize, but I could not formulate a response at the moment.';
    } catch (error) {
      console.error('AI Mentor Error:', error);
      return 'AI Mentor is currently offline. Please try again later.';
    }
  }

  public static async suggestRecoveryStrategy(
    goalTitle: string,
    missedTasksCount: number,
    daysDelayed: number
  ): Promise<string> {
    if (isAiMockMode) {
      return `Recovery suggestion: Try to dedicate 45 more minutes per day for the next 2 weeks to complete your ${missedTasksCount} missed tasks and clear the backlog.`;
    }

    try {
      const prompt = `
        A user pursuing the goal "${goalTitle}" has fallen behind. 
        They missed ${missedTasksCount} scheduled tasks and are roughly ${daysDelayed} days delayed.
        Propose a simple, actionable recovery strategy (2-3 sentences) suggesting how they can catch up (e.g. daily routine adjustments, content trimming).
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      return response.choices[0].message.content || 'Try to split tasks into smaller chunks and dedicate minor time slots during weekends.';
    } catch (error) {
      return 'Adjust your daily targets slightly higher to cover the delay gradually over the next two weeks.';
    }
  }

  private static generateMockLearningContent(topic: string): LearningContentResponse {
    return {
      content: `### Welcome to ${topic}\n\nIn this section, we cover the foundational concepts related to **${topic}**. You will learn the core mechanics, understand the terminology, and see practical examples of how it is used in the real world.\n\n**Key Objectives:**\n- Understand the terminology.\n- Learn how to apply the concepts practically.\n\nTake your time reviewing this material and complete the practice tasks before taking the quiz!`,
      practiceTasks: [
        { title: "Review the Documentation", description: "Read through the standard documentation for this topic." },
        { title: "Build a Small Prototype", description: "Apply the concept in a tiny sandbox project." },
        { title: "Explain to a Friend", description: "Try to explain the core concept to someone else simply." }
      ],
      quiz: [
        {
          question: `Which of the following best describes the main purpose of ${topic}?`,
          options: ["To slow down progress", "To build foundational understanding", "To replace all other concepts", "None of the above"],
          correctAnswerIndex: 1,
          explanation: "Foundational understanding is the core purpose of learning new topics."
        },
        {
          question: "How should you approach complex problems?",
          options: ["Ignore them", "Break them down into smaller steps", "Guess the answer", "Copy someone else"],
          correctAnswerIndex: 1,
          explanation: "Decomposition helps solve complex problems effectively."
        },
        {
          question: "What is the best way to retain new information?",
          options: ["Reading once", "Active recall and practice", "Sleeping", "Watching a movie"],
          correctAnswerIndex: 1,
          explanation: "Active recall is scientifically proven to aid memory retention."
        },
        {
          question: "Why do we use practice tasks?",
          options: ["To waste time", "To apply theory to practice", "To confuse students", "To test the compiler"],
          correctAnswerIndex: 1,
          explanation: "Application solidifies theory."
        },
        {
          question: "What should you do after failing a practice task?",
          options: ["Quit", "Review the concept and try again", "Blame the AI", "Skip the topic"],
          correctAnswerIndex: 1,
          explanation: "Iteration and learning from mistakes are part of mastering a skill."
        }
      ]
    };
  }

  private static generateMockRoadmap(
    goal: string,
    durationMonths: number,
    knowledgeLevel: string,
    learningStyle: string
  ): RoadmapResponse {
    const normGoal = goal.toLowerCase();

    if (normGoal.includes('data scientist') || normGoal.includes('data science')) {
      return {
        title: 'Become a Data Scientist',
        description: 'A comprehensive, math-and-code path to mastery in Python, ML models, and statistical analysis.',
        milestones: [
          {
            title: 'Milestone 1: Programming Foundations & Math',
            description: 'Learn Python, packages like NumPy/Pandas, and statistics basics.',
            orderIndex: 1,
            weeksDuration: 4,
            tasks: [
              { title: 'Learn Python basic structures and syntax', description: 'Variables, loops, and custom functions.', estimatedMinutes: 120, orderIndex: 1 },
              { title: 'Intro to Pandas & dataframes', description: 'Reading CSVs, filtering columns, and simple aggregations.', estimatedMinutes: 180, orderIndex: 2 },
              { title: 'Linear Algebra fundamentals', description: 'Vectors, matrices, and dot products.', estimatedMinutes: 180, orderIndex: 3 }
            ],
            resources: [
              { title: 'Kaggle Python Course', type: 'course', url: 'https://www.kaggle.com/learn/python', rationale: 'Interactive practice for practical learners.' },
              { title: 'StatQuest: Statistics Fundamentals', type: 'youtube', url: 'https://www.youtube.com/c/joshstarmer', rationale: 'Visual breakdowns of math topics.' }
            ]
          },
          {
            title: 'Milestone 2: Machine Learning & Scikit-Learn',
            description: 'Implement supervised algorithms, evaluate models, and clean datasets.',
            orderIndex: 2,
            weeksDuration: 4,
            tasks: [
              { title: 'Linear & Logistic Regression models', description: 'Theory, model fitting, and cost functions.', estimatedMinutes: 240, orderIndex: 1 },
              { title: 'Feature engineering & Handling Nulls', description: 'One-hot encoding, standard scaling, and imputers.', estimatedMinutes: 180, orderIndex: 2 },
              { title: 'Model validation & cross-validation', description: 'Train-test splits, ROC-AUC, and Confusion matrices.', estimatedMinutes: 180, orderIndex: 3 }
            ],
            resources: [
              { title: 'Hands-On Machine Learning (Géron)', type: 'book', url: 'https://www.oreilly.com/library/view/hands-on-machine-learning/9781492032632/', rationale: 'Deep concepts for thorough learning.' }
            ]
          }
        ]
      };
    }

    if (normGoal.includes('cybersecurity') || normGoal.includes('security')) {
      return {
        title: 'Become a Cybersecurity Engineer',
        description: 'Acquire security fundamentals, Linux administration, and network analysis skills.',
        milestones: [
          {
            title: 'Milestone 1: Networking & Linux Essentials',
            description: 'Learn TCP/IP layers, ports, protocols, and standard bash administration.',
            orderIndex: 1,
            weeksDuration: 4,
            tasks: [
              { title: 'Learn HTTP, DNS, DHCP, and TCP handshake', description: 'Standard port numbers and traffic flows.', estimatedMinutes: 180, orderIndex: 1 },
              { title: 'Basic Linux shell navigation', description: 'File permissions, grep, piping, and package managers.', estimatedMinutes: 180, orderIndex: 2 },
              { title: 'Wireshark packet sniffing lab', description: 'Filter packets, follow TCP streams, find unencrypted details.', estimatedMinutes: 240, orderIndex: 3 }
            ],
            resources: [
              { title: 'TryHackMe - Linux and Networking fundamentals', type: 'course', url: 'https://tryhackme.com', rationale: 'Hands-on sandbox labs matching practical style.' }
            ]
          }
        ]
      };
    }

    // Default template for generic goals
    return {
      title: goal || 'Custom Learning Roadmap',
      description: `Structured path to achieve "${goal}" under a ${durationMonths}-month timeframe.`,
      milestones: [
        {
          title: 'Milestone 1: Core Fundamentals & Setups',
          description: 'Establish the foundational concepts and tools required.',
          orderIndex: 1,
          weeksDuration: 4,
          tasks: [
            { title: 'Research basic concepts and install software tools', description: 'Gather relevant libraries and define your local environment.', estimatedMinutes: 120, orderIndex: 1 },
            { title: 'Complete first introductory tutorial', description: 'Go through a beginner-friendly tutorial series.', estimatedMinutes: 180, orderIndex: 2 }
          ],
          resources: [
            { title: 'Official Documentation & Guides', type: 'documentation', url: 'https://google.com', rationale: 'Accurate, authoritative reference text.' }
          ]
        }
      ]
    };
  }
}
