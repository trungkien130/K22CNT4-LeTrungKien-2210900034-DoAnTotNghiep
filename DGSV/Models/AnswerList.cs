using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DGSV.Api.Models
{
    [Table("AnswerList")]
    public class AnswerList
    {
        [Key]
        public int Id { get; set; }
        public string ContentAnswer { get; set; }
        [ForeignKey("QuestionId")]
        public int QuestionId { get; set; }
        public int AnswerScore { get; set; }
        public string UpdateBy { get; set; }
        public DateTime CreateDate { get; set; }
        public DateTime UpdateDate { get; set; }
        public bool Status { get; set; }
        public bool Checked { get; set; }


    }
}
