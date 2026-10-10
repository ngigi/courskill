-- Courskills career architecture seed.
-- Programme names/metadata that reference ALX are catalogue references only.
-- Do not copy proprietary ALX curriculum, assessments, media, branding, or other protected materials.

insert into public.tracks(slug,name,description,sort_order,published) values
('ai-data','AI & Data','Build practical capability in AI, analytics and data science.',10,true),
('technology','Technology','Build software, cloud and engineering skills.',20,true),
('business-technology','Business Technology','Build skills around business platforms and digital operations.',30,true),
('creative','Creative','Build practical creative and remote-work capabilities.',40,true),
('entrepreneurship','Entrepreneurship','Build founder and independent-work capabilities.',50,true),
('career-readiness','Career Readiness','Build the professional foundations that support every pathway.',60,true),
('financial-markets','Financial Markets','A dedicated Courskills academy for financial-market education and simulation.',70,true),
('courskills-original','Courskills Original','Original Courskills programmes beyond the referenced career catalogue.',80,true)
on conflict(slug) do update set name=excluded.name,description=excluded.description,sort_order=excluded.sort_order,published=excluded.published;

insert into public.programmes
(track_id,slug,title,description,duration_weeks,credential_title,credential_description,portfolio_required,source_provider,source_programme_name,source_url,published)
select t.id,v.slug,v.title,v.description,v.weeks,v.credential_title,v.credential_description,v.portfolio,v.source_provider,v.source_name,v.source_url,v.published
from (values
('ai-data','ai-career-essentials','AI & Career Essentials','AI literacy and practical workplace skills for modern professionals.',8,'Courskills AI & Career Essentials Certificate','Evidence of completion of the Courskills AI & Career Essentials pathway.',false,'ALX Africa','AI & Career Essentials','https://www.alxafrica.com/programmes/',false),
('ai-data','data-analytics','Data Analytics','A practical pathway into data analysis, reporting, visualisation, and data-driven decision making.',32,'Courskills Data Analytics Certificate','Evidence of applied data analytics capability and portfolio work.',true,'ALX Africa','Data Analytics','https://www.alxafrica.com/programmes/',false),
('ai-data','data-science','Data Science','A longer-form pathway covering programming, data preparation, modelling, visualisation, and applied data science.',64,'Courskills Data Science Certificate','Evidence of applied data science capability and portfolio work.',true,'ALX Africa','Data Science','https://www.alxafrica.com/programmes/',false),
('technology','intro-to-software-engineering','Intro to Software Engineering','An entry-level software engineering pathway covering programming foundations and practical development skills.',32,'Courskills Software Engineering Foundations Certificate','Evidence of software engineering foundations and practical projects.',true,'ALX Africa','Intro to Software Engineering','https://tech.alxafrica.com/egypt',false),
('technology','front-end-web-development','Front-End Web Development','A frontend development pathway covering web interfaces, JavaScript, version control, and practical projects.',32,'Courskills Front-End Web Development Certificate','Evidence of frontend development capability and portfolio work.',true,'ALX Africa','Front-End Web Development','https://tech.alxafrica.com/egypt',false),
('technology','back-end-web-development','Back-End Web Development','A backend development pathway covering APIs, databases, SQL, and practical application development.',32,'Courskills Back-End Web Development Certificate','Evidence of backend development capability and portfolio work.',true,'ALX Africa','Back-End Web Development','https://tech.alxafrica.com/egypt',false),
('technology','aws-cloud-computing','AWS Cloud Computing','A cloud computing pathway covering core cloud concepts and practical AWS skills.',40,'Courskills AWS Cloud Computing Certificate','Evidence of practical cloud computing capability.',true,'ALX Africa','AWS Cloud Computing','https://tech.alxafrica.com/egypt',false),
('business-technology','salesforce-administrator','Salesforce Administrator','A CRM administration pathway focused on platform configuration, customer data, workflows, and business operations.',36,'Courskills Salesforce Administration Certificate','Evidence of practical CRM administration capability.',true,'ALX Africa','Salesforce Administrator','https://tech.alxafrica.com/egypt',false),
('creative','content-creation','Content Creation','Build practical content creation skills across ideation, production, publishing, and audience growth.',24,'Courskills Content Creation Certificate','Evidence of content production and portfolio work.',true,'ALX Africa','Content Creation','https://www.alxafrica.com/programmes/',false),
('creative','graphic-design','Graphic Design','Develop visual communication and portfolio skills for professional and independent creative work.',24,'Courskills Graphic Design Certificate','Evidence of visual communication and portfolio work.',true,'ALX Africa','Graphic Design','https://www.alxafrica.com/programmes/',false),
('creative','virtual-assistant','Virtual Assistant','Develop remote-work and virtual assistance capabilities for supporting executives, teams, and businesses.',24,'Courskills Virtual Assistant Certificate','Evidence of practical virtual assistance capability.',true,'ALX Africa','Virtual Assistant','https://www.alxafrica.com/programmes/',false),
('entrepreneurship','founder-academy','Founder Academy','Learn to validate opportunities, build ventures, and develop sustainable entrepreneurial systems.',12,'Courskills Founder Academy Certificate','Evidence of venture-building work and a completed founder portfolio.',true,'ALX Africa','Founder Academy','https://www.alxafrica.com/programmes/',false),
('entrepreneurship','freelancer-academy','Freelancer Academy','Build a freelance career through positioning, client acquisition, delivery, and sustainable income systems.',12,'Courskills Freelancer Academy Certificate','Evidence of freelance readiness and a professional service portfolio.',true,'ALX Africa','Freelancer Academy','https://www.alxafrica.com/programmes/',false),
('career-readiness','professional-foundations','Professional Foundations','A foundational programme for communication, leadership, critical thinking, quantitative reasoning, task management, technology, and entrepreneurial thinking.',12,'Courskills Professional Foundations Certificate','Evidence of foundational professional capability.',false,'ALX Africa','Professional Foundations','https://www.alxafrica.com/wp-content/uploads/2025/05/Professional-Foundations-Catalogue.pdf',false),
('financial-markets','forex-academy','Forex Academy','A first-class Courskills programme for market structure, analysis, risk management, trading psychology, systematic simulation, and portfolio evidence.',12,'Courskills Forex Academy Certificate','Evidence of completion of the Courskills Forex Academy learning, assessment, journal, simulation and capstone requirements.',true,'Courskills','Forex Academy',null,true),
('courskills-original','ai-productivity','AI & Productivity','Practical AI workflows, automation and productivity systems.',10,'Courskills AI & Productivity Certificate','Evidence of practical AI workflow design and productivity projects.',true,'Courskills',null,null,false),
('courskills-original','digital-marketing','Digital Marketing','Content, social, SEO, analytics and campaign planning.',10,'Courskills Digital Marketing Certificate','Evidence of digital marketing planning and portfolio work.',true,'Courskills',null,null,false),
('courskills-original','cybersecurity-fundamentals','Cybersecurity Fundamentals','Security principles, threats, defensive practices and safe labs.',12,'Courskills Cybersecurity Fundamentals Certificate','Evidence of cybersecurity foundations and safe practical labs.',true,'Courskills',null,null,false),
('courskills-original','project-management','Project Management','Plan, execute, communicate and close practical projects.',10,'Courskills Project Management Certificate','Evidence of applied project management capability.',true,'Courskills',null,null,false),
('courskills-original','entrepreneurship','Entrepreneurship','Validation, business models, offers and operating plans.',8,'Courskills Entrepreneurship Certificate','Evidence of applied entrepreneurship work.',true,'Courskills',null,null,false)
) as v(track_slug,slug,title,description,weeks,credential_title,credential_description,portfolio,source_provider,source_name,source_url,published)
join public.tracks t on t.slug=v.track_slug
on conflict(slug) do update set
  track_id=excluded.track_id,title=excluded.title,description=excluded.description,duration_weeks=excluded.duration_weeks,
  credential_title=excluded.credential_title,credential_description=excluded.credential_description,portfolio_required=excluded.portfolio_required,
  source_provider=excluded.source_provider,source_programme_name=excluded.source_programme_name,source_url=excluded.source_url,published=excluded.published;

-- Foundation-first progression.
insert into public.programme_prerequisites(programme_id,prerequisite_programme_id,required,note)
select p.id, pf.id, true, 'Professional Foundations is the recommended starting point before the specialization.'
from public.programmes p cross join public.programmes pf
where pf.slug='professional-foundations'
  and p.slug in ('data-analytics','data-science','intro-to-software-engineering','front-end-web-development','back-end-web-development','aws-cloud-computing','salesforce-administrator','content-creation','graphic-design','virtual-assistant','founder-academy','freelancer-academy','digital-marketing','cybersecurity-fundamentals','project-management')
on conflict do nothing;

-- Complementary pathways learners can add without changing their primary career track.
insert into public.programme_relations(programme_id,related_programme_id,relation_type,sort_order,note)
select p.id,r.id,'complementary',1,'Recommended complementary programme.'
from (values
('data-analytics','ai-career-essentials'),
('data-science','ai-career-essentials'),
('front-end-web-development','back-end-web-development'),
('back-end-web-development','aws-cloud-computing'),
('founder-academy','freelancer-academy'),
('freelancer-academy','virtual-assistant'),
('content-creation','graphic-design'),
('graphic-design','content-creation'),
('professional-foundations','ai-career-essentials')
) x(a,b)
join public.programmes p on p.slug=x.a join public.programmes r on r.slug=x.b
on conflict do nothing;

-- Course containers: each programme can contain several stackable courses.
insert into public.courses(programme_id,slug,title,description,sort_order,required,published)
select p.id,'core-pathway',p.title || ' Core Pathway','Core learning sequence for the ' || p.title || ' programme.',1,true,p.published
from public.programmes p
on conflict(programme_id,slug) do update set title=excluded.title,description=excluded.description,published=excluded.published;

-- Forex remains a first-class programme, not a course buried under another pathway.
insert into public.courses(programme_id,slug,title,description,sort_order,required,published)
select id,'forex-capstone','Forex Academy Capstone','Trading plan, simulator evidence, journal review and final portfolio project.',99,true,true
from public.programmes where slug='forex-academy'
on conflict(programme_id,slug) do update set title=excluded.title,description=excluded.description,published=excluded.published;


-- Forex Academy's first-class course/module structure.
insert into public.modules(course_id,title,description,sort_order,published)
select c.id,m.title,'Courskills-owned Forex Academy module.',m.sort_order,true
from public.courses c
join public.programmes p on p.id=c.programme_id
join (values
('Introduction to Forex',1),
('How the Forex Market Works',2),
('Forex Risk Management',3),
('Fundamental Analysis',4),
('Technical Analysis',5),
('Chart Reading & Trade Setups',6),
('Trading Psychology',7),
('Building a Trading Strategy',8),
('Trading Tools & Platforms',9),
('Developing a Trading Plan',10),
('Advanced Concepts',11)
) m(title,sort_order) on true
where p.slug='forex-academy' and c.slug='core-pathway'
  and not exists(select 1 from public.modules mx where mx.course_id=c.id and mx.title=m.title);

insert into public.modules(course_id,title,description,sort_order,published)
select c.id,'Capstone: Build & Test a Trading System','Courskills-owned capstone module using simulation, journal evidence and a documented trading plan.',12,true
from public.courses c join public.programmes p on p.id=c.programme_id
where p.slug='forex-academy' and c.slug='forex-capstone'
  and not exists(select 1 from public.modules mx where mx.course_id=c.id and mx.title='Capstone: Build & Test a Trading System');
