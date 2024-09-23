exports.response = (Status, StatusCode, Meta = [], Error = { "ErrorCode": "", "ErrorMessage": "" }, Message = "", Data = [], TotalRecord = 0) => {
    return {
        Status: Status,
        StatusCode: StatusCode,
        Meta: Meta,
        Error: {
            "ErrorCode": "",
            "ErrorMessage": ""
        },
        Message: Message,
        Data: Data,
        TotalRecord: TotalRecord
    }
};