'use strict';

const questions = [
  {
    'trainingModuleId':1,
    'questions': [
      {
        'id': 1,
        'text': ' The maximum number of standard drinks that are within the low-risk drinking range for a healthy 45 year-old man are no more than ____ drinks per week (on average)',
        'choices': ['10', '12', '14', '20'],
        'key': '2'
      },
      {
        'id': 2,
        'text': ' The maximum number of standard drinks that are within the low-risk drinking range for a healthy 45 year-old man are no more than ____ drinks per drinking occasion',
        'choices': ['1', '2', '3', '4'],
        'key': '3'
      },
      {
        'id': 3,
        'text': ' The maximum number of standard drinks that are within the low-risk drinking range for a healthy, non-pregnant 35 year-old woman are no more than _______ drinks per week (on average)',
        'choices': ['4', '7', '10', '13'],
        'key': '1'
      },
      {
        'id': 4,
        'text': ' The maximum number of standard drinks that are within the low-risk drinking range for a healthy, non-pregnant 35 year-old woman are no more than _______ drinks per drinking occasion (on average)',
        'choices': ['1', '2', '3', '4'],
        'key': '2'
      },
      {
        'id': 5,
        'text': ' Which of the following people should be screened for unhealthy marijuana use?',
        'choices': ['A 19 year old girl coming in for help with an eating disorder', 'A 12 year old male coming for help with anxiety', 'A 15 year old male experiencing headaches and insomnia', 'An 80 year old woman who has had several recent falls', 'All of the above'],
        'key': '4'
      },
      {
        'id': 6,
        'text': ' Which of the following questionnaires is not appropriate for use with SBIRT?',
        'choices': ['AUDIT', 'DAST-10', 'MMPI', 'CRAFFT'],
        'key': '3'
      },
      {
        'id': 7,
        'text': ' SBIRT is most useful for:',
        'choices': ['Identifying individuals with an Alcohol Use Disorder or a Drug Use Disorder', 'Identifying people with risky substance use', 'Determining risk for acute withdrawal', 'All of the above'],
        'key': '3'
      },
      {
        'id': 8,
        'text': ' Which of the following questions is most appropriate for a Brief Intervention with Mike who misuses opioids?',
        'choices': ['I see you use opioids several times a week. Don\'t you think it\'s time to cut back?', 'Have you thought of switching to a less dangerous substance to help you avoid some of the negative effects?', 'I can see that you use opioids to relax and unwind from your job.  What about switching to deep breathing or meditation? They will do the same things for you.', 'You’ve told me about some things that you enjoy about using opioids.  What are some less enjoyable aspects of your opioid use?'],
        'key': '3'
      },
      {
        'id': 9,
        'text': ' Which of the following is NOT an accurate statement about SBIRT?',
        'choices': ['most of the patients/clients screened will not require treatment', 'most of the patients/clients screened will not score in the high-risk range', 'most of the patients/clients screened will not need to change their alcohol/drug pattern', 'most of the patients/clients screened will exceed the NIAAA drinking limits'],
        'key': '3'
      },
      {
        'id': 10,
        'text': ' The steps in a Brief Intervention are the following:',
        'choices': ['Explore the pros and cons of alcohol/drug use, provide feedback, enhance readiness, negotiate a plan', 'Educate the client, do an assessment, ask for a commitment to change', 'Do an assessment, educate the client about alcohol/drugs, teach relapse prevention methods', 'Discuss pros and cons of alcohol/drug use, work through ambivalence, refer to treatment'],
        'key': '0'
      },
      {
        'id': 11,
        'text': ' Which of the following is INCORRECT?',
        'choices': ['Screening is best done when clients/patients first request services', 'Screening should be done routinely with every new client/patient.', 'Screening can wait until the client/patient shows symptoms of alcohol/drug abuse.', 'Screening can help the clinician understand other medical and psychiatric symptoms reported by the client/patient.'],
        'key': '2'
      }
    ]
  },
  {
    'trainingModuleId':2,
    'questions':[
      {
        'id': 12,
        'text': ' Using a functional analysis to understand the context of substance misuse can accomplish all of the following goals except:',
        'choices': ['Identifying situations that are related to substance use', 'Identifying high-risk situations in which coping resources are limited or overwhelmed', 'Understanding the negative effects and consequences of substance misuse', 'Informing the patient-specific treatment plan'],
        'key': '2'
      },
      {
        'id': 13,
        'text': ' While you are conducting a functional analysis of drinking, the client you are working with described several triggers for her alcohol use that are the most common.  Which of the following triggers needs additional exploration to better understand coping deficits?',
        'choices': ['Friday night when I get off work', 'Angry at husband for blaming me', 'Time alone when I’m bored', 'When I can’t sleep because I’m worrying about things'],
        'key': '0'
      },
      {
        'id': 14,
        'text': ' While you are conducting a functional analysis of drinking, discussing “New Roads” accomplishes which of the following goals:',
        'choices': ['Gather inventory of client’s existing coping skills', 'Affirm client skills and enhance client’s confidence', 'Reframe lapses as overwhelmed resources', 'All of the above', 'Both A and B'],
        'key': '4'
      },
      {
        'id': 15,
        'text': ' The CRAFFT questionnaire should be used with:',
        'choices': ['pregnant women', 'the elderly', 'adolescents', 'dually-diagnosed clients', 'all of the above'],
        'key': '2'
      },
      {
        'id': 16,
        'text': ' Which of the following is not equivalent to one standard drink:',
        'choices': ['12 oz of 5% beer', '2 oz. of 40% spirits', '5 oz. of 12% wine'],
        'key': '1'
      },
      {
        'id': 17,
        'text': ' The Audit-10 is a screening measure designed to assess:',
        'choices': ['Marijuana Use Risk', 'Opioid Use Risk', 'Alcohol Use Risk', 'Cocaine Use Risk'],
        'key': '2'
      },
      {
        'id': 18,
        'text': ' The CUDIT-SF is a screening measure designed to assess:',
        'choices': ['Marijuana Use Risk', 'Opioid Use Risk', 'Alcohol Use Risk', 'Cocaine Use Risk'],
        'key': '0'
      },
      {
        'id': 19,
        'text': ' The RODS is a screening measure designed to assess:',
        'choices': ['Marijuana Use Risk', 'Opioid Use Risk', 'Alcohol Use Risk', 'Cocaine Use Risk'],
        'key': '1'
      }
    ]
  },
  {
    'trainingModuleId':3,
    'questions':[
      {
        'id': 20,
        'text': ' The MI approach is',
        'choices': ['Completely non-directive', 'Highly authoritarian', 'Directive but client-centered', 'Primarily educational', 'All of the above'],
        'key': '2'
      },
      {
        'id': 21,
        'text': ' I’m willing to try NA meetings',
        'choices': ['A', 'B', 'C', 'D'],
        'key': '1'
      },
      {
        'id': 22,
        'text': ' None of these ideas will work for me',
        'choices': ['A', 'B', 'C', 'D'],
        'key': '2'
      },
      {
        'id': 23,
        'text': ' One advantage is I would save money',
        'choices': ['A', 'B', 'C', 'D'],
        'key': '0'
      },
      {
        'id': 24,
        'text': ' I’m determined to quit for good this time',
        'choices': ['A', 'B', 'C', 'D'],
        'key': '1'
      },
      {
        'id': 25,
        'text': ' I was able to go two weeks without cocaine',
        'choices': ['A', 'B', 'C', 'D'],
        'key': '1'
      },
      {
        'id': 26,
        'text': ' According to Miller & Rollnick, resistance can be seen as',
        'choices': ['A trait of difficult clients', 'A healthy assertion of independence', 'A function of a mismatch between the client’s stage of change and the therapist’s strategies', 'An indicator of poor prognosis, which, if persistent, indicates that the client should be dropped from counseling.', 'None of the above'],
        'key': '2'
      },
      {
        'id': 27,
        'text': ' Therapist: “It feels unfair to you that they are holding your past against you given how hard you are trying to change.”',
        'choices': ['Closed question', 'Open question', 'Simple reflection', 'Complex reflection', 'Amplified reflection', 'Double-sided reflection'],
        'key': '3'
      },
      {
        'id': 28,
        'text': ' Therapist: “Your family does not trust you right now',
        'choices': ['Closed question', 'Open question', 'Simple reflection', 'Complex reflection', 'Amplified reflection', 'Double-sided reflection'],
        'key': '2'
      },
      {
        'id': 29,
        'text': ' Therapist: “What do you suppose their motivation might be for the suspicious questions?',
        'choices': ['Closed question', 'Open question', 'Simple reflection', 'Complex reflection', 'Amplified reflection', 'Double-sided reflection'],
        'key': '1'
      },
      {
        'id': 30,
        'text': ' You are using the Readiness Rulers to assess your client’s readiness.  From an MI-informed approach, which therapist response would be the most appropriate for this dialogue?\nT: Suppose you have made up your mind to stop using marijuana.  How confident are you right now that you could do it on a scale of 0-10 with 10 being 100% confident and 0 being not at all confident?” C: well…not very confident…maybe a 3.\nTherapist response:',
        'choices': ['“What makes it a 3 and not a 2 or even a 1?”', '“You’ve told me you quit before, does that give you more confidence that you can do this?”', '“What makes it a 3 and not a 4 or even a 5?”', '“You’ve quit before, why aren’t you more confident?”'],
        'key': '0'
      },
      {
        'id': 31,
        'text': ' According to the Relapse Prevention Model, which of the following factors are most important for understanding the risk for lapsing to substance misuse.',
        'choices': ['Changes in brain chemistry related to the severity and duration of substance misuse.', 'Use of effective coping strategies', 'Compliance with medication', 'Effective use of 12-step supports including sponsorship'],
        'key': '1'
      },
      {
        'id': 32,
        'text': ' According to the Relapse Prevention Model, the abstinence violation effect frequently includes which of the following reactions:',
        'choices': ['Negative mood', 'Belief that all is lost', 'Ineffective coping', 'Both A and B', 'A, B, and C'],
        'key': '4'
      },
      {
        'id': 33,
        'text': ' According to the Relapse Prevention Model, which of the following have emerged as high-risk situations that are the most common precipitants to lapse:',
        'choices': ['Physical discomfort, Enhancement of positive emotional state, negative emotional states', 'Negative emotional states, Social pressure, and Interpersonal conflict', 'Interpersonal conflict, Social pressure, Urges/cravings', 'Testing personal control, Urges/cravings, Negative emotional states'],
        'key': '1'
      },
      {
        'id': 34,
        'text': ' You are working with a client who has a history of severe alcohol withdrawal.  After detoxification she entered an intensive outpatient program and she has maintained abstinence for two months.  Recently she has begun to have intense cravings for alcohol.  Which of the following is most likely to reflect her pattern of craving:',
        'choices': ['When cravings are triggered, they reach a peak intensity and remain that way for the rest of the day.', ' When cravings are triggered, the intensity will build gradually throughout the day and may cause increasing levels of discomfort over time.', 'When cravings are triggered, the intensity will build gradually throughout the day and will cause increasing levels of discomfort that may require detoxification.', 'When cravings are triggered, the peak of the craving will be time limited and the craving may come in waves.'],
        'key': '3'
      },
      {
        'id': 35,
        'text': ' Which of the following is not an important concept for your client to understand about cravings:',
        'choices': ['Cravings are typically triggered by something and can be predictable if you understand your triggers', 'Absence of physical cravings is a good sign that you are not dependent.', 'Cravings are a normal and expected part of your recovery.', 'Cravings can be triggered by both internal states and external stimuli.'],
        'key': '1'
      },
      {
        'id': 36,
        'text': ' Which of the following are the primary strategies for coping with cravings and urges as described in the brief treatment manual used in this training:',
        'choices': ['Medication compliance, 12-step support, and Treatment engagement.', 'Avoid, Escape, Distract, Endure.', 'Urge surfing, Asking for support, Bringing protection, Wait it out.', 'Avoiding people, Avoiding places, and avoiding things that trigger cravings.'],
        'key': '1'
      },
      {
        'id': 37,
        'text': ' You are working on helping your client respond to social pressure to use marijuana with a co-worker with whom she has gotten high a few times. Your client has some ideas for how to respond.  Which of these would likely be the most effective for assertive refusal of the offer?',
        'choices': ['None for me', 'I have other plans tonight but thanks for the offer.', 'I promised my boyfriend that I would stop using weed.', ' I’m a little worried that the company is going to drug test us.'],
        'key': '0'
      },
      {
        'id': 38,
        'text': ' You are working on helping your client respond to social pressure to use marijuana with a co-worker with whom she has gotten high a few times. You are coaching your client on strategies for assertive refusal.  Which of the following skills would be helpful to the client for refusing offers?',
        'choices': ['Make eye contact.', 'Think about reasons for not using', 'Speak clearly at a moderate volume.', 'Keep it simple.', '“Close the door.”', 'All of the above', 'A, B, C and D', 'A, C, D and E'],
        'key': '7'
      },
      {
        'id': 39,
        'text': ' Two strategies for assertive refusal of social pressure that were discussed in this training were:',
        'choices': ['Escalating Response and Deescalating Responses', 'Escalating Response and Broken Record', 'Deescalating Response and Broken Record'],
        'key': '2'
      },
      {
        'id': 40,
        'text': ' Which of the following is not a goal of the community reinforcement approach',
        'choices': ['Eliminate the positive reinforcements of drinking', 'Confront negative behaviors that maintain substance misuse', 'Enhance the reinforcements of sobriety', 'Replace maladaptive drinking behavior with appropriate coping strategies'],
        'key': '1'
      },
      {
        'id': 41,
        'text': ' The CRAFT approach is a form of the Community Reinforcement Approach in which;',
        'choices': ['Clients who refuse to enter treatment are “treated” through family members.', 'Clients receive arts and crafts therapy groups to increase reward and pleasure', 'he Community Reinforcement Approach (CRA) is delivered to the client in combination with Family Treatment (FT)'],
        'key': '0'
      },
      {
        'id': 42,
        'text': ' Risky decision making falls into three categories of decisions.  Which of the following is not one of the three categories:',
        'choices': ['Decisions that increase exposure to risk', 'Decisions that are made using emotional reasoning', 'Decisions that decrease an activity that is focused on abstinence', 'Decisions that are made without planning'],
        'key': '1'
      },
      {
        'id': 43,
        'text': ' Which of the following client thoughts represents the risky thinking pattern “Testing Personal Control?”',
        'choices': ['“It’s free, I can’t pass that up”', '“This is more than I can handle”', '“I won’t let it get out of hand this time”', '“I can pay the price”'],
        'key': '2'
      },
      {
        'id': 44,
        'text': ' Which of the following is NOT included in the rationale for having the client work on social and recreational counseling?',
        'choices': ['Changes in use leave some void ', 'Free time can be risky for some people.', 'Triggers won’t bother you if you are busy', 'Quitting may feel like a sacrifice.', 'Being unhappy is a risk for starting again.'],
        'key': '2'
      },
      {
        'id': 45,
        'text': ' The model of understanding negative mood used in the Mood Management Module is:',
        'choices': ['ABC - Activating event, Belief, Consequence', 'STORC – Situation, Thoughts, Organ response, Response, Consequences','STARC – Situation, Time, Anger, Rescue, Consequence', 'STARC  - Situation, Thoughts, Action, Response, Consequences'],
        'key': '1'
      },
      {
        'id': 46,
        'text': ' A client you are working with has recently lapsed to using opioids after a 6-month period of abstinence.  While debriefing the lapse she says “It’s pretty clear from my behavior this weekend that I’m never going to be able to stay sober.”  Which of the following cognitive errors most likely underlies this belief:',
        'choices': ['Mind reading', 'Should and Oughts', 'Filtering', 'Overgeneralizing', 'Catastrophizing'],
        'key': '1'
      }
    ]
  }
];

module.exports = questions;
