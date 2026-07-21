import { MailchimpService } from "../services/mailchimp.js";

export const getToolDefinitions = (service: MailchimpService) => [
  {
    name: "list_automations",
    description: "List all automations in your Mailchimp account",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_automation",
    description: "Get details of a specific automation by workflow ID",
    inputSchema: {
      type: "object",
      properties: {
        workflow_id: {
          type: "string",
          description: "The workflow ID of the automation",
        },
      },
      required: ["workflow_id"],
    },
  },
  {
    name: "list_automation_emails",
    description: "List all emails in an automation",
    inputSchema: {
      type: "object",
      properties: {
        workflow_id: {
          type: "string",
          description: "The workflow ID of the automation",
        },
      },
      required: ["workflow_id"],
    },
  },
  {
    name: "get_automation_email",
    description: "Get details of a specific email in an automation",
    inputSchema: {
      type: "object",
      properties: {
        workflow_id: {
          type: "string",
          description: "The workflow ID of the automation",
        },
        email_id: {
          type: "string",
          description: "The email ID within the automation",
        },
      },
      required: ["workflow_id", "email_id"],
    },
  },
  {
    name: "list_automation_subscribers",
    description: "List subscribers in an automation email queue",
    inputSchema: {
      type: "object",
      properties: {
        workflow_id: {
          type: "string",
          description: "The workflow ID of the automation",
        },
        email_id: {
          type: "string",
          description: "The email ID within the automation",
        },
      },
      required: ["workflow_id", "email_id"],
    },
  },
  {
    name: "get_automation_queue",
    description: "Get the automation email queue",
    inputSchema: {
      type: "object",
      properties: {
        workflow_id: {
          type: "string",
          description: "The workflow ID of the automation",
        },
        email_id: {
          type: "string",
          description: "The email ID within the automation",
        },
      },
      required: ["workflow_id", "email_id"],
    },
  },
  {
    name: "list_lists",
    description:
      "List all lists in your Mailchimp account (for automation recipients)",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_list",
    description: "Get details of a specific list",
    inputSchema: {
      type: "object",
      properties: {
        list_id: {
          type: "string",
          description: "The list ID",
        },
      },
      required: ["list_id"],
    },
  },
  {
    name: "get_automation_report",
    description: "Get automation report data",
    inputSchema: {
      type: "object",
      properties: {
        workflow_id: {
          type: "string",
          description: "The workflow ID of the automation",
        },
      },
      required: ["workflow_id"],
    },
  },
  {
    name: "get_automation_email_report",
    description: "Get automation email report data",
    inputSchema: {
      type: "object",
      properties: {
        workflow_id: {
          type: "string",
          description: "The workflow ID of the automation",
        },
        email_id: {
          type: "string",
          description: "The email ID within the automation",
        },
      },
      required: ["workflow_id", "email_id"],
    },
  },
  {
    name: "get_subscriber_activity",
    description: "Get subscriber activity for an automation email",
    inputSchema: {
      type: "object",
      properties: {
        workflow_id: {
          type: "string",
          description: "The workflow ID of the automation",
        },
        email_id: {
          type: "string",
          description: "The email ID within the automation",
        },
        subscriber_hash: {
          type: "string",
          description: "The subscriber hash",
        },
      },
      required: ["workflow_id", "email_id", "subscriber_hash"],
    },
  },
  // Campaign Management
  {
    name: "list_campaigns",
    description: "List all campaigns in your Mailchimp account",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_campaign",
    description: "Get details of a specific campaign",
    inputSchema: {
      type: "object",
      properties: {
        campaign_id: {
          type: "string",
          description: "The campaign ID",
        },
      },
      required: ["campaign_id"],
    },
  },
  // Member Management
  {
    name: "list_members",
    description: "List all members in a specific list",
    inputSchema: {
      type: "object",
      properties: {
        list_id: {
          type: "string",
          description: "The list ID",
        },
      },
      required: ["list_id"],
    },
  },
  {
    name: "get_member",
    description: "Get details of a specific member",
    inputSchema: {
      type: "object",
      properties: {
        list_id: {
          type: "string",
          description: "The list ID",
        },
        subscriber_hash: {
          type: "string",
          description: "The subscriber hash",
        },
      },
      required: ["list_id", "subscriber_hash"],
    },
  },
  // Segment Management
  {
    name: "list_segments",
    description: "List all segments in a specific list",
    inputSchema: {
      type: "object",
      properties: {
        list_id: {
          type: "string",
          description: "The list ID",
        },
      },
      required: ["list_id"],
    },
  },
  {
    name: "get_segment",
    description: "Get details of a specific segment",
    inputSchema: {
      type: "object",
      properties: {
        list_id: {
          type: "string",
          description: "The list ID",
        },
        segment_id: {
          type: "number",
          description: "The segment ID",
        },
      },
      required: ["list_id", "segment_id"],
    },
  },
  // Template Management
  {
    name: "list_templates",
    description: "List all templates in your Mailchimp account",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_template",
    description: "Get details of a specific template",
    inputSchema: {
      type: "object",
      properties: {
        template_id: {
          type: "number",
          description: "The template ID",
        },
      },
      required: ["template_id"],
    },
  },
  // Campaign Reports
  {
    name: "list_campaign_reports",
    description: "List all campaign reports",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_campaign_report",
    description: "Get detailed report for a specific campaign",
    inputSchema: {
      type: "object",
      properties: {
        campaign_id: {
          type: "string",
          description: "The campaign ID",
        },
      },
      required: ["campaign_id"],
    },
  },
  // Account Information
  {
    name: "get_account",
    description: "Get account information",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  // Folder Management
  {
    name: "list_folders",
    description: "List all campaign folders",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_folder",
    description: "Get details of a specific folder",
    inputSchema: {
      type: "object",
      properties: {
        folder_id: {
          type: "string",
          description: "The folder ID",
        },
      },
      required: ["folder_id"],
    },
  },
  // Merge Fields
  {
    name: "list_merge_fields",
    description: "List all merge fields in a specific list",
    inputSchema: {
      type: "object",
      properties: {
        list_id: {
          type: "string",
          description: "The list ID",
        },
      },
      required: ["list_id"],
    },
  },
  {
    name: "get_merge_field",
    description: "Get details of a specific merge field",
    inputSchema: {
      type: "object",
      properties: {
        list_id: {
          type: "string",
          description: "The list ID",
        },
        merge_field_id: {
          type: "number",
          description: "The merge field ID",
        },
      },
      required: ["list_id", "merge_field_id"],
    },
  },
  // File Manager
  {
    name: "list_files",
    description: "List all files in the File Manager",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_file",
    description: "Get details of a specific file",
    inputSchema: {
      type: "object",
      properties: {
        file_id: {
          type: "string",
          description: "The file ID",
        },
      },
      required: ["file_id"],
    },
  },
  // Landing Pages
  {
    name: "list_landing_pages",
    description: "List all landing pages",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_landing_page",
    description: "Get details of a specific landing page",
    inputSchema: {
      type: "object",
      properties: {
        page_id: {
          type: "string",
          description: "The landing page ID",
        },
      },
      required: ["page_id"],
    },
  },
  // E-commerce Stores
  {
    name: "list_stores",
    description: "List all e-commerce stores",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_store",
    description: "Get details of a specific store",
    inputSchema: {
      type: "object",
      properties: {
        store_id: {
          type: "string",
          description: "The store ID",
        },
      },
      required: ["store_id"],
    },
  },
  // E-commerce Products
  {
    name: "list_products",
    description: "List all products in a store",
    inputSchema: {
      type: "object",
      properties: {
        store_id: {
          type: "string",
          description: "The store ID",
        },
      },
      required: ["store_id"],
    },
  },
  {
    name: "get_product",
    description: "Get details of a specific product",
    inputSchema: {
      type: "object",
      properties: {
        store_id: {
          type: "string",
          description: "The store ID",
        },
        product_id: {
          type: "string",
          description: "The product ID",
        },
      },
      required: ["store_id", "product_id"],
    },
  },
  // E-commerce Orders
  {
    name: "list_orders",
    description: "List all orders in a store",
    inputSchema: {
      type: "object",
      properties: {
        store_id: {
          type: "string",
          description: "The store ID",
        },
      },
      required: ["store_id"],
    },
  },
  {
    name: "get_order",
    description: "Get details of a specific order",
    inputSchema: {
      type: "object",
      properties: {
        store_id: {
          type: "string",
          description: "The store ID",
        },
        order_id: {
          type: "string",
          description: "The order ID",
        },
      },
      required: ["store_id", "order_id"],
    },
  },
  // Conversations
  {
    name: "list_conversations",
    description: "List all conversations",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_conversation",
    description: "Get details of a specific conversation",
    inputSchema: {
      type: "object",
      properties: {
        conversation_id: {
          type: "string",
          description: "The conversation ID",
        },
      },
      required: ["conversation_id"],
    },
  },
  {
    name: "create_template",
    description:
      "Create a new email template from HTML. Note: templates created via the API are code-edit only and cannot be edited in Mailchimp's drag-and-drop editor.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of the template",
        },
        html: {
          type: "string",
          description: "The raw HTML for the template",
        },
        folder_id: {
          type: "string",
          description: "Optional folder ID to file the template under",
        },
      },
      required: ["name", "html"],
    },
  },
  {
    name: "update_template",
    description:
      "Update an existing template. Mailchimp requires both name and html; the html fully replaces the template's existing markup, so fetch the current template first if you only want to tweak it.",
    inputSchema: {
      type: "object",
      properties: {
        template_id: {
          type: "number",
          description: "The template ID",
        },
        name: {
          type: "string",
          description: "The name of the template",
        },
        html: {
          type: "string",
          description: "The full replacement HTML for the template",
        },
        folder_id: {
          type: "string",
          description: "Optional folder ID to file the template under",
        },
      },
      required: ["template_id", "name", "html"],
    },
  },
  {
    name: "create_campaign",
    description:
      "Create a new draft campaign targeting an audience (list), optionally narrowed to a saved segment. The campaign is created as a DRAFT — nothing is sent. Use set_campaign_content to attach a template or HTML, then send_campaign or schedule_campaign.",
    inputSchema: {
      type: "object",
      properties: {
        list_id: {
          type: "string",
          description: "The audience (list) ID to send to",
        },
        subject_line: {
          type: "string",
          description: "The email subject line",
        },
        from_name: {
          type: "string",
          description: "The sender name recipients will see",
        },
        reply_to: {
          type: "string",
          description: "The reply-to email address",
        },
        title: {
          type: "string",
          description:
            "Internal campaign title (defaults to the subject line)",
        },
        preview_text: {
          type: "string",
          description: "Optional preview/preheader text",
        },
        template_id: {
          type: "number",
          description: "Optional template ID to use for the campaign content",
        },
        saved_segment_id: {
          type: "number",
          description:
            "Optional saved segment ID to target a subset of the audience instead of the full list",
        },
      },
      required: ["list_id", "subject_line", "from_name", "reply_to"],
    },
  },
  {
    name: "update_campaign_settings",
    description:
      "Update settings (subject line, preview text, title, from name, reply-to) of an existing draft campaign",
    inputSchema: {
      type: "object",
      properties: {
        campaign_id: {
          type: "string",
          description: "The campaign ID",
        },
        subject_line: {
          type: "string",
          description: "New subject line",
        },
        preview_text: {
          type: "string",
          description: "New preview/preheader text",
        },
        title: {
          type: "string",
          description: "New internal campaign title",
        },
        from_name: {
          type: "string",
          description: "New sender name",
        },
        reply_to: {
          type: "string",
          description: "New reply-to email address",
        },
      },
      required: ["campaign_id"],
    },
  },
  {
    name: "set_campaign_content",
    description:
      "Set the content of a draft campaign, either from an existing template (template_id) or from raw HTML. Provide exactly one of template_id or html.",
    inputSchema: {
      type: "object",
      properties: {
        campaign_id: {
          type: "string",
          description: "The campaign ID",
        },
        template_id: {
          type: "number",
          description: "Template ID to use as the campaign content",
        },
        html: {
          type: "string",
          description: "Raw HTML to use as the campaign content",
        },
      },
      required: ["campaign_id"],
    },
  },
  {
    name: "send_campaign",
    description:
      "IRREVERSIBLY send a campaign to its audience immediately. Real emails go out to real subscribers and this cannot be undone. Always confirm with the user and review the campaign (get_campaign, get_campaign_send_checklist) before calling. Requires confirm=true.",
    inputSchema: {
      type: "object",
      properties: {
        campaign_id: {
          type: "string",
          description: "The campaign ID",
        },
        confirm: {
          type: "boolean",
          description:
            "Must be true. Safety acknowledgement that the user has explicitly approved sending this campaign now.",
        },
      },
      required: ["campaign_id", "confirm"],
    },
  },
  {
    name: "schedule_campaign",
    description:
      "Schedule a draft campaign for a future send. schedule_time must be UTC ISO 8601 on a quarter-hour boundary (:00, :15, :30, :45), e.g. 2026-08-01T09:15:00+00:00. Requires a paid Mailchimp plan. Confirm with the user before scheduling.",
    inputSchema: {
      type: "object",
      properties: {
        campaign_id: {
          type: "string",
          description: "The campaign ID",
        },
        schedule_time: {
          type: "string",
          description:
            "UTC ISO 8601 datetime on a quarter-hour boundary (:00/:15/:30/:45)",
        },
      },
      required: ["campaign_id", "schedule_time"],
    },
  },
  {
    name: "unschedule_campaign",
    description: "Unschedule a previously scheduled campaign, returning it to draft",
    inputSchema: {
      type: "object",
      properties: {
        campaign_id: {
          type: "string",
          description: "The campaign ID",
        },
      },
      required: ["campaign_id"],
    },
  },
  {
    name: "get_campaign_send_checklist",
    description:
      "Get Mailchimp's pre-send checklist for a campaign — items that must pass before the campaign can be sent",
    inputSchema: {
      type: "object",
      properties: {
        campaign_id: {
          type: "string",
          description: "The campaign ID",
        },
      },
      required: ["campaign_id"],
    },
  },
];

export const handleToolCall = async (
  service: MailchimpService,
  name: string,
  args: any
) => {
  switch (name) {
    case "list_automations":
      const automations = await service.listAutomations();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              automations.automations.map((a) => ({
                id: a.id,
                name: a.name,
                status: a.status,
                type: a.type,
                create_time: a.create_time,
              })),
              null,
              2
            ),
          },
        ],
      };

    case "get_automation":
      const automation = await service.getAutomation(args.workflow_id);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(automation, null, 2),
          },
        ],
      };

    case "list_automation_emails":
      const emails = await service.listAutomationEmails(args.workflow_id);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              emails.emails.map((e) => ({
                id: e.id,
                position: e.position,
                status: e.status,
                subject_line: e.settings.subject_line,
                emails_sent: e.emails_sent,
              })),
              null,
              2
            ),
          },
        ],
      };

    case "get_automation_email":
      const email = await service.getAutomationEmail(
        args.workflow_id,
        args.email_id
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(email, null, 2),
          },
        ],
      };

    case "list_automation_subscribers":
      const subscribers = await service.listAutomationSubscribers(
        args.workflow_id,
        args.email_id
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              subscribers.subscribers.map((s) => ({
                email_address: s.email_address,
                status: s.status,
                merge_fields: s.merge_fields,
              })),
              null,
              2
            ),
          },
        ],
      };

    case "get_automation_queue":
      const queue = await service.getAutomationQueue(
        args.workflow_id,
        args.email_id
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(queue, null, 2),
          },
        ],
      };

    case "list_lists":
      const lists = await service.listLists();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              lists.lists.map((l) => ({
                id: l.id,
                name: l.name,
                member_count: l.stats.member_count,
                date_created: l.date_created,
              })),
              null,
              2
            ),
          },
        ],
      };

    case "get_list":
      const list = await service.getList(args.list_id);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(list, null, 2),
          },
        ],
      };

    case "get_automation_report":
      const report = await service.getAutomationReport(args.workflow_id);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(report, null, 2),
          },
        ],
      };

    case "get_automation_email_report":
      const emailReport = await service.getAutomationEmailReport(
        args.workflow_id,
        args.email_id
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(emailReport, null, 2),
          },
        ],
      };

    case "get_subscriber_activity":
      const activity = await service.getSubscriberActivity(
        args.workflow_id,
        args.email_id,
        args.subscriber_hash
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(activity, null, 2),
          },
        ],
      };

    // Campaign Management
    case "list_campaigns":
      const campaigns = await service.listCampaigns();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              campaigns.campaigns.map((c) => ({
                id: c.id,
                type: c.type,
                status: c.status,
                create_time: c.create_time,
                send_time: c.send_time,
              })),
              null,
              2
            ),
          },
        ],
      };

    case "get_campaign":
      const campaign = await service.getCampaign(args.campaign_id);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(campaign, null, 2),
          },
        ],
      };

    // Member Management
    case "list_members":
      const members = await service.listMembers(args.list_id);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              members.members.map((m) => ({
                id: m.id,
                email_address: m.email_address,
                status: m.status,
                member_rating: m.member_rating,
                last_changed: m.last_changed,
              })),
              null,
              2
            ),
          },
        ],
      };

    case "get_member":
      const member = await service.getMember(
        args.list_id,
        args.subscriber_hash
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(member, null, 2),
          },
        ],
      };

    // Segment Management
    case "list_segments":
      const segments = await service.listSegments(args.list_id);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              segments.segments.map((s) => ({
                id: s.id,
                name: s.name,
                member_count: s.member_count,
                type: s.type,
                created_at: s.created_at,
              })),
              null,
              2
            ),
          },
        ],
      };

    case "get_segment":
      const segment = await service.getSegment(args.list_id, args.segment_id);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(segment, null, 2),
          },
        ],
      };

    // Template Management
    case "list_templates":
      const templates = await service.listTemplates();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              templates.templates.map((t) => ({
                id: t.id,
                name: t.name,
                type: t.type,
                drag_and_drop: t.drag_and_drop,
                responsive: t.responsive,
                active: t.active,
                date_created: t.date_created,
              })),
              null,
              2
            ),
          },
        ],
      };

    case "get_template":
      const template = await service.getTemplate(args.template_id);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(template, null, 2),
          },
        ],
      };

    // Campaign Reports
    case "list_campaign_reports":
      const campaignReports = await service.listCampaignReports();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              campaignReports.reports.map((r) => ({
                id: r.id,
                campaign_title: r.campaign_title,
                type: r.type,
                emails_sent: r.emails_sent,
                send_time: r.send_time,
                opens: r.opens,
                clicks: r.clicks,
              })),
              null,
              2
            ),
          },
        ],
      };

    case "get_campaign_report":
      const campaignReport = await service.getCampaignReport(args.campaign_id);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(campaignReport, null, 2),
          },
        ],
      };

    // Account Information
    case "get_account":
      const account = await service.getAccount();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(account, null, 2),
          },
        ],
      };

    // Folder Management
    case "list_folders":
      const folders = await service.listFolders();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              folders.folders.map((f) => ({
                id: f.id,
                name: f.name,
                count: f.count,
              })),
              null,
              2
            ),
          },
        ],
      };

    case "get_folder":
      const folder = await service.getFolder(args.folder_id);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(folder, null, 2),
          },
        ],
      };

    // Merge Fields
    case "list_merge_fields":
      const mergeFields = await service.listMergeFields(args.list_id);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              mergeFields.merge_fields.map((mf) => ({
                id: mf.id,
                name: mf.name,
                type: mf.type,
                required: mf.required,
                public: mf.public,
                display_order: mf.display_order,
              })),
              null,
              2
            ),
          },
        ],
      };

    case "get_merge_field":
      const mergeField = await service.getMergeField(
        args.list_id,
        args.merge_field_id
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(mergeField, null, 2),
          },
        ],
      };

    // File Manager
    case "list_files":
      const files = await service.listFiles();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              files.files.map((f) => ({
                id: f.id,
                name: f.name,
                size: f.size,
                created_at: f.created_at,
              })),
              null,
              2
            ),
          },
        ],
      };

    case "get_file":
      const file = await service.getFile(args.file_id);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(file, null, 2),
          },
        ],
      };

    // Landing Pages
    case "list_landing_pages":
      const landingPages = await service.listLandingPages();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              landingPages.landing_pages.map((lp) => ({
                id: lp.id,
                name: lp.name,
                type: lp.type,
                created_at: lp.created_at,
              })),
              null,
              2
            ),
          },
        ],
      };

    case "get_landing_page":
      const landingPage = await service.getLandingPage(args.page_id);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(landingPage, null, 2),
          },
        ],
      };

    // E-commerce Stores
    case "list_stores":
      const stores = await service.listStores();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              stores.stores.map((s) => ({
                id: s.id,
                name: s.name,
                domain: s.domain,
                created_at: s.created_at,
              })),
              null,
              2
            ),
          },
        ],
      };

    case "get_store":
      const store = await service.getStore(args.store_id);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(store, null, 2),
          },
        ],
      };

    // E-commerce Products
    case "list_products":
      const products = await service.listProducts(args.store_id);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              products.products.map((p) => ({
                id: p.id,
                title: p.title,
                type: p.type,
                vendor: p.vendor,
              })),
              null,
              2
            ),
          },
        ],
      };

    case "get_product":
      const product = await service.getProduct(args.store_id, args.product_id);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(product, null, 2),
          },
        ],
      };

    // E-commerce Orders
    case "list_orders":
      const orders = await service.listOrders(args.store_id);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              orders.orders.map((o) => ({
                id: o.id,
                order_total: o.order_total,
                currency_code: o.currency_code,
                financial_status: o.financial_status,
              })),
              null,
              2
            ),
          },
        ],
      };

    case "get_order":
      const order = await service.getOrder(args.store_id, args.order_id);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(order, null, 2),
          },
        ],
      };

    // Conversations
    case "list_conversations":
      const conversations = await service.listConversations();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              conversations.conversations.map((c) => ({
                id: c.id,
                subject: c.subject,
                from_email: c.from_email,
                timestamp: c.timestamp,
              })),
              null,
              2
            ),
          },
        ],
      };

    case "get_conversation":
      const conversation = await service.getConversation(args.conversation_id);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(conversation, null, 2),
          },
        ],
      };

    case "create_template": {
      const created = await service.createTemplate(
        args.name,
        args.html,
        args.folder_id
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(created, null, 2),
          },
        ],
      };
    }

    case "update_template": {
      const updated = await service.updateTemplate(
        args.template_id,
        args.name,
        args.html,
        args.folder_id
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(updated, null, 2),
          },
        ],
      };
    }

    case "create_campaign": {
      const campaign = await service.createCampaign({
        listId: args.list_id,
        subjectLine: args.subject_line,
        fromName: args.from_name,
        replyTo: args.reply_to,
        title: args.title,
        previewText: args.preview_text,
        templateId: args.template_id,
        savedSegmentId: args.saved_segment_id,
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(campaign, null, 2),
          },
        ],
      };
    }

    case "update_campaign_settings": {
      const settings: any = {};
      if (args.subject_line !== undefined)
        settings.subject_line = args.subject_line;
      if (args.preview_text !== undefined)
        settings.preview_text = args.preview_text;
      if (args.title !== undefined) settings.title = args.title;
      if (args.from_name !== undefined) settings.from_name = args.from_name;
      if (args.reply_to !== undefined) settings.reply_to = args.reply_to;
      const updated = await service.updateCampaignSettings(
        args.campaign_id,
        settings
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(updated, null, 2),
          },
        ],
      };
    }

    case "set_campaign_content": {
      if (!args.template_id && !args.html) {
        throw new Error(
          "set_campaign_content requires either template_id or html"
        );
      }
      const content = await service.setCampaignContent(args.campaign_id, {
        templateId: args.template_id,
        html: args.html,
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(content, null, 2),
          },
        ],
      };
    }

    case "send_campaign": {
      if (args.confirm !== true) {
        throw new Error(
          "send_campaign refused: confirm must be true. Get explicit user approval before sending."
        );
      }
      await service.sendCampaign(args.campaign_id);
      return {
        content: [
          {
            type: "text",
            text: `Campaign ${args.campaign_id} is sending. This cannot be undone.`,
          },
        ],
      };
    }

    case "schedule_campaign": {
      await service.scheduleCampaign(args.campaign_id, args.schedule_time);
      return {
        content: [
          {
            type: "text",
            text: `Campaign ${args.campaign_id} scheduled for ${args.schedule_time} (UTC).`,
          },
        ],
      };
    }

    case "unschedule_campaign": {
      await service.unscheduleCampaign(args.campaign_id);
      return {
        content: [
          {
            type: "text",
            text: `Campaign ${args.campaign_id} unscheduled and returned to draft.`,
          },
        ],
      };
    }

    case "get_campaign_send_checklist": {
      const checklist = await service.getCampaignSendChecklist(
        args.campaign_id
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(checklist, null, 2),
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
};
