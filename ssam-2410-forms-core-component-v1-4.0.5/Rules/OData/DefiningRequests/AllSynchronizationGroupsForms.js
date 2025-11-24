export default function AllSynchronizationGroupsForms(context) {
    const definingRequests = [
			{
				"Name": "DataTableData",
				"Query": "DataTableData"
			},
			{
				"Name": "DataTableMasters",
				"Query": "DataTableMasters"
			},
			{
				"Name": "Definitions",
				"Query": "Definitions"
			},
			{
				"Name": "Events",
				"Query": "Events"
			},
			{
				"Name": "Images",
				"Query": "Images",
				"AutomaticallyRetrievesStreams": true
			},
			{
				"Name": "Mappings",
				"Query": "Mappings"
			},
			{
				"Name": "SubmissionImages",
				"Query": "SubmissionImages",
				"AutomaticallyRetrievesStreams": true
			},
			{
				"Name": "Submissions",
				"Query": "Submissions"
			},
			{
				"Name": "UserGroups",
				"Query": "UserGroups"
			},
			{
				"Name": "UserInfo",
				"Query": "UserInfo"
			},
			{
				"Name": "Users",
				"Query": "Users"
			}
    ]
    return definingRequests;
}
